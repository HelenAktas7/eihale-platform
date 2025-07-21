from db import connection  

def get_teklifler_by_kullanici_id(kullanici_id):
    try:
        cursor = connection.cursor()  
        cursor.execute("""
            SELECT id, ihale_id, teklif_tutari, teklif_tarihi
            FROM teklifler
            WHERE kullanici_id = :1
        """, (kullanici_id,)) 
        teklifler = cursor.fetchall()  
        return teklifler
    except Exception as e:
        print("Hata:", e)
        return []
