import oracledb
import uuid
import datetime

connection = oracledb.connect(
    user="system",
    password="34281",
    dsn="localhost:1521/XEPDB1"
)

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
        return ihale_id
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
   
      
    except oracledb.Error as e:
        print("Hata olustu:", e)
    finally:
        if cursor:
            cursor.close()
    return teklif_id           

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
    
def get_db_connection():
    return oracledb.connect(
        user="system",
        password="34281",
        dsn="localhost:1521/XEPDB1"
    )

def get_ihale_by_id(ihale_id):
    try:
        cursor = connection.cursor()
        cursor.execute("""
            SELECT id, baslik, aciklama, baslangic_tarihi, bitis_tarihi, olusturan_id
            FROM ihaleler
            WHERE id = :1
        """, (ihale_id,))
        ihale = cursor.fetchone()
        return ihale
    except Exception as e:
        print("Hata:", e)
        return None
    
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




    

    


        


 




