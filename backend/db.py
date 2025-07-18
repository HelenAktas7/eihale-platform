import oracledb
import uuid
import datetime

connection = oracledb.connect(
    user="system",
    password="34281",
    dsn="localhost:1521/XEPDB1"
)

def insert_kullanici(isim, email):
    try:
        cursor = connection.cursor()
        user_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO kullanicilar (id, isim, email)
            VALUES (:1, :2, :3)
        """, (user_id, isim, email))
        connection.commit()
        print("Kullanici basariyla eklendi.ID:",user_id)
        return user_id
    except oracledb.Error as e:
        print("Hata olustu:", e)
    finally:
        if cursor:
            cursor.close()

def insert_ihale(baslik, aciklama, baslangic_tarihi, bitis_tarihi, olusturan_id):
    try:
        cursor = connection.cursor()
        ihale_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO ihaleler (id, baslik, aciklama, baslangic_tarihi, bitis_tarihi, olusturan_id)
            VALUES (:1, :2, :3, TO_DATE(:4, 'YYYY-MM-DD'), TO_DATE(:5, 'YYYY-MM-DD'), :6)
        """, (ihale_id, baslik, aciklama, baslangic_tarihi, bitis_tarihi, olusturan_id))
        connection.commit()
        print("İhale basariyla eklendi.İhale id:",ihale_id,"olusturan id :",olusturan_id)
    except oracledb.Error as e:
        print("Hata olustu:", e)
    finally:
        if cursor:
            cursor.close()

def insert_teklif(teklif_miktari, ihale_id, teklif_veren_id):
    try:
        cursor = connection.cursor()
        teklif_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO teklifler (id, teklif_miktari, ihale_id, kullanici_id)
            VALUES (:1, :2, :3, :4)
        """, (teklif_id, teklif_miktari, ihale_id, teklif_veren_id))
        connection.commit()
        print("Teklif basariyla eklendi.",teklif_id)
        return teklif_id
    except oracledb.Error as e:
        print("Hata olustu:", e)
    finally:
        if cursor:
            cursor.close()

def get_teklifler_by_ihale_id(ihale_id):
    try:
        cursor=connection.cursor() 
        query="SELECT * FROM teklifler WHERE ihale_id = :1"
        cursor.execute(query,[ihale_id])  
        result=cursor.fetchall()
        return result
    except Exception as e:
        print("Hata : ",e)
        return[]
    
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
        query = "SELECT id, baslik, aciklama, baslangic_tarihi, bitis_tarihi, olusturan_id FROM ihaleler"
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

    


        


 




