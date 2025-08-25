import oracledb
import uuid
import datetime
from datetime import datetime
import os
from werkzeug.utils import secure_filename
from flask import send_from_directory
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

connection = oracledb.connect(
    user="system",
    password="34281",
    dsn="localhost:1521/XEPDB1"
)
def fetch_one(query: str, params: dict):
    with connection.cursor() as cur:
        cur.execute(query, params)
        return cur.fetchone()

def fetch_all(query: str, params: dict):
    with connection.cursor() as cur:
        cur.execute(query, params)
        return cur.fetchall()

def execute(query: str, params: dict):
    with connection.cursor() as cur:
        cur.execute(query, params)
    connection.commit()
def insert_kullanici(isim, email, sifre, rol):
    try:
        user_id = str(uuid.uuid4())
        connection = oracledb.connect(
            user="system",
            password="34281",
            dsn="localhost:1521/XEPDB1"
        )
        cursor = connection.cursor()

        cursor.execute("""
            INSERT INTO KULLANICILAR (ID, ISIM, EMAIL, SIFRE, ROL)
            VALUES (:1, :2, :3, :4, :5)
        """, (user_id, isim, email, sifre, rol))

        connection.commit()
        cursor.close()
        connection.close()
        return user_id
    except Exception as e:
        print("Hata:", e)
        raise e
def get_ihale_resimleri(ihale_id):
    cur = connection.cursor()
    cur.execute("""
        SELECT resim_adi FROM ihale_gorselleri
        WHERE ihale_id = :ihale_id
    """, {"ihale_id": ihale_id})
    rows = cur.fetchall()
    cur.close()
    return [r[0] for r in rows]

   

def insert_ihale(
    baslik, aciklama, baslangic_tarihi, bitis_tarihi,
    kategori_id, olusturan_id,
    yil=None, vites=None, km=None, yakit_turu=None, renk=None,
    metrekare=None, oda_sayisi=None, bina_yasi=None,
    hizmet_turu=None, sure_gun=None
):
    try:
        cursor = connection.cursor()
        ihale_id = str(uuid.uuid4())

   
        cursor.execute("""
            INSERT INTO ihaleler (id, baslik, aciklama, baslangic_tarihi, bitis_tarihi, olusturan_id, aktif, kategori_id)
            VALUES (:1, :2, :3, TO_DATE(:4, 'YYYY-MM-DD"T"HH24:MI'), TO_DATE(:5, 'YYYY-MM-DD"T"HH24:MI'), :6, 1, :7)
        """, (
            ihale_id, baslik, aciklama, baslangic_tarihi, bitis_tarihi, olusturan_id, kategori_id
        ))

      
        if any([yil, vites, km, yakit_turu, renk]):
            cursor.execute("""
                INSERT INTO ihale_arac_detaylari (id, ihale_id, yil, vites, km, yakit_turu, renk)
                VALUES (:1, :2, :3, :4, :5, :6, :7)
            """, (
                str(uuid.uuid4()), ihale_id, yil, vites, km, yakit_turu, renk
            ))

        if any([metrekare, oda_sayisi, bina_yasi]):
            cursor.execute("""
                INSERT INTO ihale_yapi_detaylari (id, ihale_id, metrekare, oda_sayisi, bina_yasi)
                VALUES (:1, :2, :3, :4, :5)
            """, (
                str(uuid.uuid4()), ihale_id, metrekare, oda_sayisi, bina_yasi
            ))

       
        if any([hizmet_turu, sure_gun]):
            cursor.execute("""
                INSERT INTO ihale_hizmet_detaylari (id, ihale_id, hizmet_turu, sure_gun)
                VALUES (:1, :2, :3, :4)
            """, (
                str(uuid.uuid4()), ihale_id, hizmet_turu, sure_gun
            ))

        connection.commit()
        print("İhale başarıyla eklendi. İhale ID:", ihale_id)
        return ihale_id
    except oracledb.Error as e:
        print("Hata oluştu:", e)
        raise
    finally:
        if cursor:
            cursor.close()



def insert_teklif(ihale_id, kullanici_id, teklif_miktari, teklif_tarihi):
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT OLUSTURAN_ID, BITIS_TARIHI
                FROM IHALELER
                WHERE ID = :id
            """, {"id": str(ihale_id).strip()})
            
            result = cursor.fetchone()

            if not result:
                return {"hata": "İhale bulunamadi"}

            ihale_olusturan_id = result[0]
            bitis_tarihi = result[1]

            if ihale_olusturan_id == kullanici_id:
                return {"hata": "Kendi ihalenize teklif veremezsiniz"}

            su_an = datetime.now()
            if bitis_tarihi <= su_an:
                return {"hata": "Bu ihalenin süresi dolmuştur, teklif veremezsiniz."}

            teklif_uuid = str(uuid.uuid4())

            cursor.execute("""
                INSERT INTO TEKLIFLER (ID, IHALE_ID, KULLANICI_ID, TEKLIF_MIKTARI, TEKLIF_TARIHI)
                VALUES (:id, :ihale_id, :kullanici_id, :miktar, TO_TIMESTAMP(:tarih, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"'))
            """, {
                "id": teklif_uuid,
                "ihale_id": ihale_id,
                "kullanici_id": kullanici_id,
                "miktar": teklif_miktari,
                "tarih": teklif_tarihi[:23] 
            })

            connection.commit()
            return teklif_uuid
    except Exception as e:
        print("Hata (insert_teklif):", e)
        return {"hata": str(e)}
def get_all_kullanicilar():
    try:
        cursor = connection.cursor()
        query = "SELECT id, isim, email FROM kullanicilar"
        cursor.execute(query)
        rows = cursor.fetchall()
        return rows
    except Exception as e:
        print("Hata:", e)
        return []
def get_all_ihaleler(filters=None):
    query = """
        SELECT 
            i.id,
            i.baslik,
            i.aciklama,
            i.baslangic_tarihi,
            i.bitis_tarihi,
            i.baslangic_bedeli,
            i.olusturan_id,
            i.aktif,
            k.kod AS kategori_kod,
            ad.yil,
            ad.km,
            ad.vites,
            ad.yakit_turu,
            ad.renk,
            yd.metrekare,
            yd.oda_sayisi,
            yd.bina_yasi,
            hd.hizmet_suresi,
            hd.kapsam
        FROM ihaleler i
        JOIN kategoriler k ON i.kategori_id = k.id
        LEFT JOIN ihale_arac_detaylari ad ON i.id = ad.ihale_id
        LEFT JOIN ihale_yapi_detaylari yd ON i.id = yd.ihale_id
        LEFT JOIN ihale_hizmet_detaylari hd ON i.id = hd.ihale_id
        WHERE 1=1
    """
    params = {}

    if filters:
        if "ad" in filters and filters["ad"]:
            query += " AND LOWER(i.baslik) LIKE :ad"
            params["ad"] = f"%{filters['ad'].lower()}%"

        if "numara" in filters and filters["numara"]:
            query += " AND CAST(i.id AS VARCHAR(50)) LIKE :numara"
            params["numara"] = f"%{filters['numara']}%"

        if "icerik" in filters and filters["icerik"]:
            query += " AND LOWER(i.aciklama) LIKE :icerik"
            params["icerik"] = f"%{filters['icerik'].lower()}%"

        if "yer" in filters and filters["yer"]:
            query += " AND LOWER(i.konum) LIKE :yer"
            params["yer"] = f"%{filters['yer'].lower()}%"

        if "minFiyat" in filters and filters["minFiyat"]:
            query += " AND i.baslangic_bedeli >= :minFiyat"
            params["minFiyat"] = filters["minFiyat"]

        if "maxFiyat" in filters and filters["maxFiyat"]:
            query += " AND i.baslangic_bedeli <= :maxFiyat"
            params["maxFiyat"] = filters["maxFiyat"]

        if "kategori" in filters and filters["kategori"]:
            query += " AND k.kod = :kategori"
            params["kategori"] = filters["kategori"]

    query += " ORDER BY i.baslangic_tarihi DESC"

    cur = connection.cursor()
    cur.execute(query, params)
    rows = cur.fetchall()
    cur.close()

    ihaleler = []
    for r in rows:
        ihaleler.append({
            "id": r[0],
            "baslik": r[1],
            "aciklama": r[2],
            "baslangic_tarihi": str(r[3]) if r[3] else None,
            "bitis_tarihi": str(r[4]) if r[4] else None,
            "baslangic_bedeli": r[5],
            "olusturan_id": r[6],
            "aktif": r[7],
            "kategori_kod": r[8],
            "yil": r[9],
            "km": r[10],
            "vites": r[11],
            "yakit_turu": r[12],
            "renk": r[13],
            "metrekare": r[14],
            "oda_sayisi": r[15],
            "bina_yasi": r[16],
            "hizmet_suresi": r[17],
            "kapsam": r[18],
            "resimler": get_ihale_resimleri(r[0])  
        })
    return ihaleler





def get_kazananlar():
    try:
        cursor = connection.cursor()

        query = """
        SELECT 
            t.ihale_id,
            t.id AS teklif_id,
            t.kullanici_id,
            t.teklif_miktari,
            i.baslik,
            i.bitis_tarihi
        FROM teklifler t
        JOIN (
            SELECT ihale_id, MAX(teklif_miktari) AS max_tutar
            FROM teklifler
            GROUP BY ihale_id
        ) max_t ON t.ihale_id = max_t.ihale_id AND t.teklif_miktari = max_t.max_tutar
        JOIN ihaleler i ON i.id = t.ihale_id
        WHERE i.bitis_tarihi < :1
        """

        now = datetime.datetime.now()
        cursor.execute(query, [now])
        return cursor.fetchall()
    except Exception as e:
        print("Hata:", e)
        return []
    
def get_db_connection():
    return oracledb.connect(
        user="system",
        password="34281",
        dsn="localhost:1521/XEPDB1"
    )

def get_ihale_by_id(ihale_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT 
            i.id,
            i.baslik,
            i.aciklama,
            i.baslangic_tarihi,
            i.bitis_tarihi,
            i.baslangic_bedeli,
            i.olusturan_id,
            i.konum,
            k.kod AS kategori_kod
        FROM ihaleler i
        JOIN kategoriler k ON i.kategori_id = k.id
        WHERE i.id = :id
    """, {"id": ihale_id})
    ihale = cursor.fetchone()

    if not ihale:
        return None

    cursor.execute("""
        SELECT yil, km, vites, yakit_turu, renk
        FROM ihale_arac_detaylari
        WHERE ihale_id = :id
    """, {"id": ihale_id})
    arac_detay = cursor.fetchone()

    cursor.execute("""
        SELECT metrekare, oda_sayisi, bina_yasi
        FROM ihale_yapi_detaylari
        WHERE ihale_id = :id
    """, {"id": ihale_id})
    yapi_detay = cursor.fetchone()
  
    cursor.execute("""
        SELECT hizmet_suresi, kapsam, calisma_saatleri
        FROM ihale_hizmet_detaylari
        WHERE ihale_id = :id
    """, {"id": ihale_id})
    hizmet_detay = cursor.fetchone()

    cursor.execute("""
        SELECT resim_adi
        FROM ihale_gorselleri
        WHERE ihale_id = :id
    """, {"id": ihale_id})
    resimler = [row[0] for row in cursor.fetchall()]

    return {
        "id": ihale[0],
        "baslik": ihale[1],
        "aciklama": ihale[2],
        "baslangic_tarihi": str(ihale[3]),
        "bitis_tarihi": str(ihale[4]),
        "baslangic_bedeli": ihale[5],
        "olusturan_id": ihale[6],
        "konum":ihale[7],
        "kategori": ihale[8],
        "ozellikler": {
          
            "yil": arac_detay[0] if arac_detay else None,
            "km": arac_detay[1] if arac_detay else None,
            "vites": arac_detay[2] if arac_detay else None,
            "yakit_turu": arac_detay[3] if arac_detay else None,
            "renk": arac_detay[4] if arac_detay else None,
          
            "metrekare": yapi_detay[0] if yapi_detay else None,
            "oda_sayisi": yapi_detay[1] if yapi_detay else None,
            "bina_yasi": yapi_detay[2] if yapi_detay else None,
         
            "hizmet_suresi": hizmet_detay[0] if hizmet_detay else None,
            "kapsam": hizmet_detay[1] if hizmet_detay else None,
            "calisma_saatleri": hizmet_detay[2] if hizmet_detay else None
        },
        "resimler": resimler
    }


def get_ihaleler_by_kullanici_id(kullanici_id):
    try:
        cursor = connection.cursor()
        cursor.execute("""
            SELECT id, baslik, aciklama, baslangic_tarihi, bitis_tarihi, olusturan_id
            FROM ihaleler
            WHERE olusturan_id = :1
        """, (kullanici_id,))
        return cursor.fetchall()
    except Exception as e:
        print("Hata:", e)
        return []
    
def get_ihaleler_by_teklif_veren(kullanici_id):
    try:
        cursor = connection.cursor()
        query = """
        SELECT DISTINCT i.id, i.baslik, i.aciklama, i.baslangic_tarihi, i.bitis_tarihi, i.olusturan_id
        FROM ihaleler i
        JOIN teklifler t ON i.id = t.ihale_id
        WHERE t.kullanici_id = :1
        """
        cursor.execute(query, (kullanici_id,))
        return cursor.fetchall()
    except Exception as e:
        print("Hata:", e)
        return []
    
def get_ihale_detay(ihale_id):
    try:
        with connection.cursor() as cursor:
            
            cursor.execute("""
                SELECT 
                    i.ID,
                    i.BASLIK,
                    i.ACIKLAMA,
                    i.BASLANGIC_TARIHI,
                    i.BITIS_TARIHI,
                    i.BASLANGIC_BEDELI,
                    i.AKTIF,
                    k.KOD AS kategori_kod,
                    ad.YIL,
                    ad.KM,
                    ad.VITES,
                    ad.YAKIT_TURU,
                    ad.RENK,
                    yd.METREKARE,
                    yd.ODA_SAYISI,
                    yd.BINA_YASI
                FROM IHALELER i
                LEFT JOIN KATEGORILER k ON i.KATEGORI_ID = k.ID
                LEFT JOIN ARAC_DETAY ad ON i.ID = ad.IHALE_ID
                LEFT JOIN YAPI_DETAY yd ON i.ID = yd.IHALE_ID
                WHERE LOWER(i.ID) = LOWER(:id)
            """, {"id": str(ihale_id).strip()})

            result = cursor.fetchone()

            if not result:
                print(f"ID bulunamadi: {ihale_id}")
                return None

            detay = {
                "ihale_id": result[0],
                "baslik": result[1],
                "aciklama": result[2],
                "baslangic_tarihi": str(result[3]),
                "bitis_tarihi": str(result[4]),
                "baslangic_bedeli": float(result[5]) if result[5] else None,
                "aktif": bool(result[6]),
                "kategori_kod": result[7],
                "yil": result[8],
                "km": result[9],
                "vites": result[10],
                "yakit_turu": result[11],
                "renk": result[12],
                "metrekare": result[13],
                "oda_sayisi": result[14],
                "bina_yasi": result[15]
            }

           
            cursor.execute("""
                SELECT RESIM_ADI 
                FROM IHALE_GORSELLERI 
                WHERE IHALE_ID = :id
                ORDER BY RESIM_ADI
            """, {"id": str(ihale_id).strip()})

            gorsel_rows = cursor.fetchall()
            detay["gorseller"] = [row[0] for row in gorsel_rows] if gorsel_rows else []

            return detay

    except Exception as e:
        print("Hata (get_ihale_detay):", e)
        return None




def get_aktif_ihaleler(filters=None):
    query = """
        SELECT i.id,
               i.baslik,
               i.aciklama,
               i.konum,
               i.baslangic_bedeli,
               i.bitis_tarihi,
               k.kod AS kategori_kod,
               ia.yil, ia.km, ia.vites, ia.yakit_turu,
               iy.metrekare, iy.oda_sayisi, iy.bina_yasi,
               ih.hizmet_suresi, ih.kapsam,
               LISTAGG(g.resim_adi, ',') WITHIN GROUP (ORDER BY g.resim_adi) AS resimler
        FROM ihaleler i
        JOIN kategoriler k ON i.kategori_id = k.id
        LEFT JOIN ihale_arac_detaylari ia ON i.id = ia.ihale_id
        LEFT JOIN ihale_yapi_detaylari iy ON i.id = iy.ihale_id
        LEFT JOIN ihale_hizmet_detaylari ih ON i.id = ih.ihale_id
        LEFT JOIN ihale_gorselleri g ON i.id = g.ihale_id
        WHERE i.aktif = 1
    """
    params = {}

  
    if filters:
        if filters.get("ad"):
            query += " AND LOWER(i.baslik) LIKE :ad"
            params["ad"] = f"%{filters['ad'].lower()}%"
        if filters.get("numara"):
            query += " AND i.id LIKE :numara"
            params["numara"] = f"%{filters['numara']}%"
        if filters.get("icerik"):
            query += " AND LOWER(i.aciklama) LIKE :icerik"
            params["icerik"] = f"%{filters['icerik'].lower()}%"
        if filters.get("yer"):
            query += " AND LOWER(i.konum) LIKE :yer"
            params["yer"] = f"%{filters['yer'].lower()}%"
        if filters.get("minFiyat"):
            query += " AND i.baslangic_bedeli >= :minFiyat"
            params["minFiyat"] = filters["minFiyat"]
        if filters.get("maxFiyat"):
            query += " AND i.baslangic_bedeli <= :maxFiyat"
            params["maxFiyat"] = filters["maxFiyat"]
        if filters.get("kategori"):
            query += " AND k.kod = :kategori"
            params["kategori"] = filters["kategori"]

    query += """
        GROUP BY i.id, i.baslik, i.aciklama, i.konum, i.baslangic_bedeli, 
                 i.bitis_tarihi, k.kod, ia.yil, ia.km, ia.vites, ia.yakit_turu,
                 iy.metrekare, iy.oda_sayisi, iy.bina_yasi, ih.hizmet_suresi, ih.kapsam
    """

    cur = connection.cursor()
    cur.execute(query, params)
    rows = cur.fetchall()
    cur.close()
    return rows


def get_sonuc_ihaleler(filters=None):
    query = """
        SELECT i.id,
               i.baslik,
               i.aciklama,
               i.konum,
               i.baslangic_bedeli,
               i.bitis_tarihi,
               k.kod AS kategori_kod,
               ia.yil, ia.km, ia.vites, ia.yakit_turu,
               iy.metrekare, iy.oda_sayisi, iy.bina_yasi,
               ih.hizmet_suresi, ih.kapsam,
               LISTAGG(g.resim_adi, ',') WITHIN GROUP (ORDER BY g.resim_adi) AS resimler
        FROM ihaleler i
        JOIN kategoriler k ON i.kategori_id = k.id
        LEFT JOIN ihale_arac_detaylari ia ON i.id = ia.ihale_id
        LEFT JOIN ihale_yapi_detaylari iy ON i.id = iy.ihale_id
        LEFT JOIN ihale_hizmet_detaylari ih ON i.id = ih.ihale_id
        LEFT JOIN ihale_gorselleri g ON i.id = g.ihale_id
        WHERE i.aktif = 0 OR i.bitis_tarihi < SYSDATE
    """
    params = {}

    if filters:
        if filters.get("ad"):
            query += " AND LOWER(i.baslik) LIKE :ad"
            params["ad"] = f"%{filters['ad'].lower()}%"
        if filters.get("numara"):
            query += " AND i.id LIKE :numara"
            params["numara"] = f"%{filters['numara']}%"
        if filters.get("icerik"):
            query += " AND LOWER(i.aciklama) LIKE :icerik"
            params["icerik"] = f"%{filters['icerik'].lower()}%"
        if filters.get("yer"):
            query += " AND LOWER(i.konum) LIKE :yer"
            params["yer"] = f"%{filters['yer'].lower()}%"
        if filters.get("minFiyat"):
            query += " AND i.baslangic_bedeli >= :minFiyat"
            params["minFiyat"] = filters["minFiyat"]
        if filters.get("maxFiyat"):
            query += " AND i.baslangic_bedeli <= :maxFiyat"
            params["maxFiyat"] = filters["maxFiyat"]
        if filters.get("kategori"):
            query += " AND k.kod = :kategori"
            params["kategori"] = filters["kategori"]

    query += """
        GROUP BY i.id, i.baslik, i.aciklama, i.konum, i.baslangic_bedeli, 
                 i.bitis_tarihi, k.kod, ia.yil, ia.km, ia.vites, ia.yakit_turu,
                 iy.metrekare, iy.oda_sayisi, iy.bina_yasi, ih.hizmet_suresi, ih.kapsam
    """

    cur = connection.cursor()
    cur.execute(query, params)
    rows = cur.fetchall()
    cur.close()
    return rows

def get_suresi_gecmis_ihaleler():
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT ID, BASLIK, ACIKLAMA, BITIS_TARIHI
                FROM IHALELER
                WHERE BITIS_TARIHI <= SYSDATE
                ORDER BY BITIS_TARIHI DESC
            """)
            return cursor.fetchall()
    except Exception as e:
        print("Hata (get_suresi_gecmis_ihaleler):", e)
        return []
    
def get_teklifler_by_ihale_id(ihale_id):
    try:
        with connection.cursor() as cursor:
            cursor.execute(""" 
                SELECT t.id,
                       t.kullanici_id,
                       t.teklif_miktari,
                       TO_CHAR(t.teklif_tarihi, 'YYYY-MM-DD HH24:MI:SS')
                FROM teklifler t 
                WHERE t.ihale_id = :ihale_id 
                ORDER BY t.teklif_miktari DESC
            """, {"ihale_id": ihale_id})

            rows = cursor.fetchall()

            teklifler = []
            for row in rows:
                teklifler.append({
                    "id": row[0],
                    "kullanici_id": row[1],
                    "teklif_miktari": row[2],
                    "teklif_tarihi": row[3]
                })

            return teklifler
    except Exception as e:
        print("DB Hata (get_teklifler_by_ihale_id):", e)
        return []

def update_teklif(teklif_id,yeni_miktar):
    try:
        with connection.cursor() as cursor:
            cursor.execute(""" 
               UPDATE teklifler
               SET teklif_miktari=:1
               WHERE id=:2                    
        """,(yeni_miktar,teklif_id)) 
            connection.commit()
            return True
    except Exception as e:
        print("Teklif guncelleme hatasi:",e)
        return False    

def db_get_user_by_id(user_id: str):
    """Return dict or None"""
    row = fetch_one("""
        SELECT id, isim, email, telefon
        FROM kullanicilar
        WHERE id = :id
    """, {"id": user_id})
    if not row:
        return None
    return {"id": row[0], "isim": row[1], "email": row[2], "telefon": row[3]}

def db_list_auctions_by_creator(user_id: str):
    rows = fetch_all("""
        SELECT i.id, i.baslik, i.bitis_tarihi, i.aktif,
               COALESCE(LISTAGG(g.resim_adi, ',') WITHIN GROUP (ORDER BY g.resim_adi), '') as resimler
        FROM ihaleler i
        LEFT JOIN ihale_gorselleri g ON i.id = g.ihale_id
        WHERE i.olusturan_id = :id
        GROUP BY i.id, i.baslik, i.bitis_tarihi, i.aktif
        ORDER BY i.bitis_tarihi DESC
    """, {"id": user_id})

    result = []
    for r in rows:
        resimler = r[4].split(",") if r[4] else []
        result.append({
            "id": r[0],
            "baslik": r[1],
            "bitis_tarihi": str(r[2]),
            "aktif": r[3],
            "resimler": resimler
        })
    return result

def db_list_distinct_bidded_auctions(user_id: str):
    cur = connection.cursor()
    cur.execute("""
        SELECT DISTINCT
            i.id,
            i.baslik,
            i.aciklama,
            i.baslangic_tarihi,
            i.bitis_tarihi,
            i.baslangic_bedeli,
            i.olusturan_id,
            i.aktif,
            k.kod AS kategori_kod,

            ad.yil,
            ad.km,
            ad.vites,
            ad.yakit_turu,
            ad.renk,

            yd.metrekare,
            yd.oda_sayisi,
            yd.bina_yasi,

            hd.hizmet_suresi,
            hd.kapsam

        FROM teklifler t
        JOIN ihaleler i ON t.ihale_id = i.id
        JOIN kategoriler k ON i.kategori_id = k.id
        LEFT JOIN ihale_arac_detaylari ad ON i.id = ad.ihale_id
        LEFT JOIN ihale_yapi_detaylari yd ON i.id = yd.ihale_id
        LEFT JOIN ihale_hizmet_detaylari hd ON i.id = hd.ihale_id
        WHERE t.kullanici_id = :user_id
        ORDER BY i.baslangic_tarihi DESC
    """, {"user_id": user_id})
    
    rows = cur.fetchall()
    cur.close()

    ihaleler = []
    for r in rows:
        ihaleler.append({
            "id": r[0],
            "baslik": r[1],
            "aciklama": r[2],
            "baslangic_tarihi": str(r[3]) if r[3] else None,
            "bitis_tarihi": str(r[4]) if r[4] else None,
            "baslangic_bedeli": r[5],
            "olusturan_id": r[6],
            "aktif": r[7],
            "kategori_kod": r[8],

            "yil": r[9],
            "km": r[10],
            "vites": r[11],
            "yakit_turu": r[12],
            "renk": r[13],

            "metrekare": r[14],
            "oda_sayisi": r[15],
            "bina_yasi": r[16],

            "hizmet_suresi": r[17],
            "kapsam": r[18],

            "resimler": get_ihale_resimleri(r[0])  
        })
    return ihaleler




def db_list_won_auctions(user_id: str):
    cur = connection.cursor()
    cur.execute("""
        SELECT 
            i.id,
            i.baslik,
            i.aciklama,
            i.baslangic_tarihi,
            i.bitis_tarihi,
            i.baslangic_bedeli,
            i.olusturan_id,
            i.aktif,
            k.kod AS kategori_kod,

            ad.yil,
            ad.km,
            ad.vites,
            ad.yakit_turu,
            ad.renk,

            yd.metrekare,
            yd.oda_sayisi,
            yd.bina_yasi,

            hd.hizmet_suresi,
            hd.kapsam,

            t.teklif_miktari
        FROM teklifler t
        JOIN ihaleler i ON t.ihale_id = i.id
        JOIN kategoriler k ON i.kategori_id = k.id
        LEFT JOIN ihale_arac_detaylari ad ON i.id = ad.ihale_id
        LEFT JOIN ihale_yapi_detaylari yd ON i.id = yd.ihale_id
        LEFT JOIN ihale_hizmet_detaylari hd ON i.id = hd.ihale_id
        WHERE t.kullanici_id = :id
          AND t.teklif_miktari = (
              SELECT MAX(teklif_miktari)
              FROM teklifler
              WHERE ihale_id = i.id
          )
        ORDER BY i.bitis_tarihi DESC
    """, {"id": user_id})

    rows = cur.fetchall()
    cur.close()

    ihaleler = []
    for r in rows:
        ihaleler.append({
            "id": r[0],
            "baslik": r[1],
            "aciklama": r[2],
            "baslangic_tarihi": str(r[3]) if r[3] else None,
            "bitis_tarihi": str(r[4]) if r[4] else None,
            "baslangic_bedeli": r[5],
            "olusturan_id": r[6],
            "aktif": r[7],
            "kategori_kod": r[8],

            "yil": r[9],
            "km": r[10],
            "vites": r[11],
            "yakit_turu": r[12],
            "renk": r[13],

            "metrekare": r[14],
            "oda_sayisi": r[15],
            "bina_yasi": r[16],

            "hizmet_suresi": r[17],
            "kapsam": r[18],

            "kazanan_teklif": r[19], 

            "resimler": get_ihale_resimleri(r[0])
        })
    return ihaleler


def db_update_profile(user_id: str, isim: str, email: str, telefon: str):
    execute("""
        UPDATE kullanicilar
        SET isim = :isim, email = :email, telefon = :telefon
        WHERE id = :id
    """, {"isim": isim, "email": email, "telefon": telefon, "id": user_id})

def db_get_password_hash(user_id: str):
    row = fetch_one("SELECT sifre FROM kullanicilar WHERE id = :id", {"id": user_id})
    return row[0] if row else None

def db_update_password_hash(user_id: str, new_hash: str):
    execute("UPDATE kullanicilar SET sifre = :s WHERE id = :id", {"s": new_hash, "id": user_id})








    

    


        


 




