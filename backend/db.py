import oracledb
import uuid
import datetime
from datetime import datetime
import os
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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

   

def insert_ihale(baslik, aciklama, baslangic_tarihi, bitis_tarihi, baslangic_bedeli, kategori_id, olusturan_id):
    try:
        cursor = connection.cursor()
        ihale_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO ihaleler (id, baslik, aciklama, baslangic_tarihi, bitis_tarihi, baslangic_bedeli, olusturan_id, aktif, kategori_id)
            VALUES (:1, :2, :3, TO_DATE(:4, 'YYYY-MM-DD"T"HH24:MI'), TO_DATE(:5, 'YYYY-MM-DD"T"HH24:MI'), :6, :7, 1, :8)
        """, (
            ihale_id, baslik, aciklama, baslangic_tarihi, bitis_tarihi, baslangic_bedeli, olusturan_id, kategori_id
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
def insert_ihale_gorsel(ihale_id, file):
    cursor = connection.cursor()
    try:
        if file.filename != "":
            filename = secure_filename(file.filename)
            unique_name = f"{uuid.uuid4()}_{filename}"
            filepath = os.path.join(UPLOAD_FOLDER, unique_name)
            file.save(filepath)

            cursor.execute("""
                INSERT INTO ihale_gorselleri (id, ihale_id, resim_adi)
                VALUES (:1, :2, :3)
            """, (str(uuid.uuid4()), ihale_id, unique_name))
            connection.commit()
    except Exception as e:
        print("Görsel ekleme hatası:", e)
        raise
    finally:
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
    
def get_all_ihaleler():
    try:
        cursor = connection.cursor()
        query = "SELECT id, baslik, aciklama, baslangic_tarihi, bitis_tarihi, olusturan_id, aktif ,km,yil,vites FROM ihaleler"
        cursor.execute(query)
        return cursor.fetchall()
    except Exception as e:
        print("Hata:", e)
        return []

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
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT id, baslik, aciklama, baslangic_tarihi, bitis_tarihi, olusturan_id
            FROM ihaleler
            WHERE id = :id
        """, {"id": ihale_id})
        return cursor.fetchone()

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
                    i.BITIS_TARIHI,
                    (
                        SELECT MAX(t.TEKLIF_MIKTARI)
                        FROM TEKLIFLER t
                        WHERE t.IHALE_ID = i.ID
                    ) AS en_yuksek_teklif,
                    (
                        SELECT COUNT(DISTINCT t.KULLANICI_ID)
                        FROM TEKLIFLER t
                        WHERE t.IHALE_ID = i.ID
                    ) AS katilimci_sayisi
                FROM IHALELER i
                WHERE LOWER(i.ID) = LOWER(:id)
            """, {"id": str(ihale_id).strip()})

            result = cursor.fetchone()

            if result:
                return {
                    "ihale_id": result[0],
                    "baslik": result[1],
                    "aciklama": result[2],
                    "bitis_tarihi": str(result[3]),
                    "en_yuksek_teklif": float(result[4]) if result[4] is not None else 0.0,
                    "katilimci_sayisi": int(result[5]) if result[5] is not None else 0
                }
            else:
                print(f"ID bulunamadi: {ihale_id}")
                return None
    except Exception as e:
        print("Hata (get_ihale_detay):", e)
        return None

def get_aktif_ihaleler():
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT ID, BASLIK, ACIKLAMA, BITIS_TARIHI
                FROM IHALELER
                WHERE BITIS_TARIHI > SYSDATE
                ORDER BY BITIS_TARIHI ASC
            """)
            return cursor.fetchall()
    except Exception as e:
        print("Hata (get_aktif_ihaleler):", e)
        return []

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
        SELECT id, baslik, bitis_tarihi, aktif
        FROM ihaleler
        WHERE olusturan_id = :id
        ORDER BY bitis_tarihi DESC
    """, {"id": user_id})
    return [{"id": r[0], "baslik": r[1], "bitis_tarihi": str(r[2]), "aktif": r[3]} for r in rows]

def db_list_distinct_bidded_auctions(user_id: str):
    rows = fetch_all("""
        SELECT DISTINCT i.id, i.baslik, i.bitis_tarihi
        FROM teklifler t
        JOIN ihaleler i ON t.ihale_id = i.id
        WHERE t.kullanici_id = :id
        ORDER BY i.bitis_tarihi DESC
    """, {"id": user_id})
    return [{"id": r[0], "baslik": r[1], "bitis_tarihi": str(r[2])} for r in rows]

def db_list_won_auctions(user_id: str):
    rows = fetch_all("""
        SELECT i.id, i.baslik, i.bitis_tarihi, t.teklif_miktari
        FROM teklifler t
        JOIN ihaleler i ON t.ihale_id = i.id
        WHERE t.kullanici_id = :id
          AND t.teklif_miktari = (
            SELECT MAX(teklif_miktari)
            FROM teklifler
            WHERE ihale_id = i.id
          )
        ORDER BY i.bitis_tarihi DESC
    """, {"id": user_id})
    return [{
        "id": r[0], "baslik": r[1],
        "bitis_tarihi": str(r[2]), "teklif_miktari": r[3]
    } for r in rows]

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








    

    


        


 




