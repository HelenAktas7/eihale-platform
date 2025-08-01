import jwt
from functools import wraps
from flask import Flask, jsonify, request
from teklif_services import get_teklifler_by_kullanici_id
from flask_cors import CORS
from db import connection
from datetime import datetime, timedelta


def token_gerektiriyor(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({"message": "Token eksik"}), 403

        try:
            decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.kullanici = decoded_token
        except Exception as e:
            return jsonify({"message": "Token doğrulama başarısız", "hata": str(e)}), 403

        return f(*args, **kwargs)
    return decorated


def admin_gerektiriyor(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not hasattr(request, "kullanici"):
            return jsonify({"message": "Yetkisiz erişim"}), 403

        if request.kullanici.get("rol") != "admin":
            return jsonify({"message": "Admin yetkisi gerekli"}), 403

        return f(*args, **kwargs)
    return decorated

from db import (
    get_db_connection,
    get_teklifler_by_ihale_id,
    get_all_kullanicilar,
    insert_kullanici,
    insert_ihale,
    insert_teklif,
    get_all_ihaleler,
    get_kazananlar,
    get_ihale_by_id,
    get_ihaleler_by_teklif_veren,
    get_ihale_detay,
    get_aktif_ihaleler,
    get_suresi_gecmis_ihaleler,
    get_ihaleler_by_kullanici_id,
    get_teklifler_by_ihale_id,
    update_teklif
)

SECRET_KEY = 'cok-gizli-anahtarim'

app = Flask(__name__)
CORS(app) 

@app.route('/')
def home():
    return jsonify(message="E-Ihale sistemi basariyla calisiyor!")

@app.route('/kullanicilar', methods=['GET'])
def get_kullanicilar():
    try:
        kullanicilar = get_all_kullanicilar()
        return jsonify([
            {"id": k[0], "isim": k[1], "email": k[2]}
            for k in kullanicilar
        ])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/kullanici', methods=['POST'])
def yeni_kullanici_ekle():
    veri = request.get_json()
    isim = veri.get("isim")
    email = veri.get("email")
    sifre = veri.get("sifre")
    rol = veri.get("rol", "kullanici")

    if not isim or not email or not sifre:
        return jsonify({"message": "İsim, email ve şifre gerekli"}), 400

    try:
        user_id = insert_kullanici(isim, email, sifre, rol)
        return jsonify({"message": "Kullanici eklendi", "id": user_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ihale', methods=['POST'])
@token_gerektiriyor

def yeni_ihale_ekle(current_user):
    veri = request.get_json()
    try: 
        data=request.get_json()
        ihale_id = insert_ihale(
            veri["baslik"],
            veri["aciklama"],
            veri["baslangic_tarihi"],
            veri["bitis_tarihi"],
            current_user["id"]
        )
        return jsonify({"message": "Ihale eklendi", "id": ihale_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/teklif', methods=['POST'])

def yeni_teklif_ekle():
    veri = request.get_json()
    try:
        teklif_id = insert_teklif(
            veri["ihale_id"],
            veri["kullanici_id"],
            veri["tutar"],
            veri["teklif_tarihi"]
        )
        if isinstance(teklif_id, dict) and "hata" in teklif_id:
            return jsonify({"error": teklif_id["hata"]}), 400
        
        return jsonify({"message": "Teklif eklendi", "id": teklif_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ihaleler/<ihale_id>/teklifler', methods=['GET'])
def get_teklifler_by_ihale(ihale_id):
    try:
        teklifler = get_teklifler_by_ihale_id(ihale_id)
        if not teklifler:
            return jsonify({"message": "Bu ihaleye ait teklif bulunamadi"}), 404

        return jsonify([
            {
                "teklif_id": t[0],
                "ihale_id": t[1],
                "kullanici_id": t[2],
                "tutar": t[3],
                "tarih": str(t[4])
            }
            for t in teklifler
        ])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ihaleler', methods=['GET'])
def tum_ihaleleri_getir():
    try:
        ihaleler = get_all_ihaleler()
        return jsonify([
            {
                "id": i[0],
                "baslik": i[1],
                "aciklama": i[2],
                "baslangic_tarihi": str(i[3]),
                "bitis_tarihi": str(i[4]),
                "olusturan_id": i[5],
                "aktif":i[6]
            }
            for i in ihaleler
        ])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/kazananlar', methods=['GET'])
def kazananlari_getir():
    try:
        kazananlar = get_kazananlar()
        if not kazananlar:
            return jsonify({"message": "Henuz kazanan yok"}), 404

        return jsonify([
            {
                "ihale_id": k[0],
                "teklif_id": k[1],
                "kullanici_id": k[2],
                "teklif_miktari": k[3],
                "baslik": k[4],
                "bitis_tarihi": str(k[5])
            }
            for k in kazananlar
        ])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/giris', methods=['POST'])
def kullanici_giris():
    veri = request.get_json()
    email = veri.get("email")
    sifre = veri.get("sifre")

    if not email or not sifre:
        return jsonify({"message": "Email ve sifre gerekli"}), 400

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT id, isim, rol FROM kullanicilar 
            WHERE email = :1 AND sifre = :2
        """, (email, sifre))

        sonuc = cursor.fetchone()
        cursor.close()
        connection.close()

        if sonuc:
            user_id, isim, rol = sonuc

            token = jwt.encode({
                "id": user_id,
                "isim": isim,
                "rol": rol,
                "exp": datetime.now() + timedelta(hours=2)  
            }, SECRET_KEY, algorithm="HS256")

            return jsonify({"token": token})

        else:
            return jsonify({"message": "Email veya sifre hatali"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/admin/kullanicilar', methods=['GET'])
@token_gerektiriyor
@admin_gerektiriyor
def admin_kullanicilari_gor():
    try:
        kullanicilar = get_all_kullanicilar()
        return jsonify([
            {"id": k[0], "isim": k[1], "email": k[2]}
            for k in kullanicilar
        ])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/kullanici/teklifler', methods=['GET'])
@token_gerektiriyor 
def kullanici_tekliflerini_gor(current_user): 
    try:
        teklifler = get_teklifler_by_kullanici_id(current_user["id"])  
        return jsonify([
            {
                "id": t[0],
                "ihale_id": t[1],
                "teklif_tutari": t[2],
                "teklif_tarihi": str(t[3]) 
            } for t in teklifler
        ])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/ihale/<ihale_id>', methods=['GET'])
def ihale_detaylarini_gor(ihale_id):
    try:
        ihale = get_ihale_by_id(ihale_id)
        if not ihale:
            return jsonify({"message": "Ihale bulunamadi"}), 404

        return jsonify({
            "id": ihale[0],
            "baslik": ihale[1],
            "aciklama": ihale[2],
            "baslangic_tarihi": str(ihale[3]),
            "bitis_tarihi": str(ihale[4]),
            "olusturan_id": ihale[5]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/kullanici/ihaleler', methods=['GET'])
@token_gerektiriyor
def kullanicinin_ihaleleri(current_user):
    try:
        ihaleler = get_ihaleler_by_kullanici_id(current_user["id"])
        return jsonify([
            {
                "id": i[0],
                "baslik": i[1],
                "aciklama": i[2],
                "baslangic_tarihi": str(i[3]),
                "bitis_tarihi": str(i[4]),
                "olusturan_id": i[5]
            }
            for i in ihaleler
        ])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/kullanici/katildigi-ihaleler', methods=['GET'])
@token_gerektiriyor
def kullanici_katildigi_ihaleleri_gor(current_user):
    try:
        ihaleler = get_ihaleler_by_teklif_veren(current_user["id"])
        return jsonify([
            {
                "id": i[0],
                "baslik": i[1],
                "aciklama": i[2],
                "baslangic_tarihi": str(i[3]),
                "bitis_tarihi": str(i[4]),
                "olusturan_id": i[5]
            }
            for i in ihaleler
        ])
    except Exception as e:
        return jsonify({"error": str(e)}), 500  
     
@app.route('/ihale/<ihale_id>/detay', methods=['GET'])
def ihale_detay(ihale_id):
    try:
        print("GELEN ID:", ihale_id)  
        detay = get_ihale_detay(ihale_id) 
        if detay:
            return jsonify(detay), 200 
        else:
            return jsonify({"hata": "İhale bulunamadi"}), 404  
    except Exception as e:
        return jsonify({"hata": str(e)}), 500   
    
@app.route('/ihaleler/aktif', methods=['GET'])
def aktif_ihaleleri_getir():
    try:
        ihaleler = get_aktif_ihaleler()
        return jsonify([
            {
                "id": i[0],
                "baslik": i[1],
                "aciklama": i[2],
                "bitis_tarihi": i[3].strftime('%Y-%m-%d')
            }
            for i in ihaleler
        ])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ihaleler/gecmis', methods=['GET'])
def gecmis_ihaleleri_getir():
    try:
        ihaleler = get_suresi_gecmis_ihaleler()
        return jsonify([
            {
                "id": i[0],
                "baslik": i[1],
                "aciklama": i[2],
                "bitis_tarihi": i[3].strftime('%Y-%m-%d')
            }
            for i in ihaleler
        ])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/ihale/<ihale_id>/teklifler', methods=["GET"])
def get_teklifler_for_ihale(ihale_id):
    try:
     teklifler=get_teklifler_by_ihale_id(ihale_id)
     return jsonify(teklifler) 
    except Exception as e:
           print("Hata (teklif listeleme):",e)
           return jsonify({"error ": str(e)}),500
    
@app.route('/teklif/<teklif_id>',methods=['PUT'])
def teklif_guncelle(teklif_id):
    try:
        veri=request.get_json()
        yeni_miktar=veri.get("yeni_miktar")
        if not  yeni_miktar:
            return jsonify({"hata":"Yeni miktar eksik"}),400
        
        basarili=update_teklif(teklif_id,yeni_miktar)
        if basarili:
            return jsonify({"mesaj":"Teklif güncellendi"})
        else:
            return jsonify({"hata":"Teklif güncellenemedi"}),500
    except Exception as e :
     return jsonify({"hata":str(e)}),500
    

@app.route("/ihale/<ihale_id>/kazanan", methods=["GET"])
@token_gerektiriyor
@admin_gerektiriyor
def kazanan_teklifi_getir(ihale_id):
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT kullanici_id, teklif_miktari, teklif_tarihi
                FROM teklifler
                WHERE ihale_id = :ihale_id
                ORDER BY teklif_miktari DESC, teklif_tarihi ASC
                FETCH FIRST 1 ROWS ONLY
            """, {"ihale_id": ihale_id})

            result = cursor.fetchone()

            if result:
                teklif_tarihi = result[2]

                if teklif_tarihi is None:
                    tarih_str = ""
                elif isinstance(teklif_tarihi, datetime):
                    tarih_str = teklif_tarihi.strftime("%Y-%m-%d %H:%M:%S")
                else:
                    tarih_str = str(teklif_tarihi)

                return jsonify({
                    "kullanici_id": result[0],
                    "teklif_miktari": result[1],
                    "teklif_tarihi": tarih_str
                })
            else:
                return jsonify({"mesaj": "Bu ihaleye hiç teklif verilmemiş."}), 404
    except Exception as e:
        return jsonify({"hata": str(e)}), 500
    

@app.route("/admin/ihale/<ihale_id>",methods=["DELETE"])
@token_gerektiriyor
@admin_gerektiriyor
def ihale_sil(ihale_id):
  try:
      with connection.cursor() as cursor:
          cursor.execute("DELETE FROM teklifler WHERE ihale_id=:id",{"id":ihale_id})
          cursor.execute("DELETE FROM ihaleler WHERE id=:id",{"id":ihale_id})
          connection.commit()
          return jsonify({"mesaj":"İhale silindi."}),200
  except Exception as e:
      return jsonify({"hata":str(e)}),500
  
@app.route("/admin/kullanici/<kullanici_id>", methods=["DELETE"])
@token_gerektiriyor
@admin_gerektiriyor
def kullanici_sil(kullanici_id):
    try:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM teklifler WHERE kullanici_id = :id", {"id": kullanici_id})
            cursor.execute("DELETE FROM ihaleler WHERE olusturan_id = :id", {"id": kullanici_id})
            cursor.execute("DELETE FROM kullanicilar WHERE id = :id", {"id": kullanici_id})
        connection.commit()
        return jsonify({"mesaj": "Kullanıcı silindi."}), 200
    except Exception as e:
        return jsonify({"hata": str(e)}), 500
    
@app.route("/admin/kullanici/<kullanici_id>/teklifler",methods=["GET"])
@token_gerektiriyor
@admin_gerektiriyor
def get_user_teklifler(kullanici_id):
   try:
       print(" İstenen kullanıcı ID:", kullanici_id)
       with connection.cursor() as cursor:
           cursor.execute("""
                          SELECT t.id,t.teklif_miktari,t.teklif_tarihi,i.baslik
                          FROM teklifler t
                          JOIN ihaleler i ON t.ihale_id = i.id
                          WHERE t.kullanici_id = :id
                          ORDER BY t.teklif_tarihi DESC 
""" ,{"id": kullanici_id})
           rows=cursor.fetchall()
           
           print(" Çekilen teklifler:", rows)
           return jsonify([
               {"id":row[0],
               "teklif_miktari":row[1],
               "teklif_tarihi":row[2],
               "ihale_baslik":row[3]
               }for row in rows
           ])
   except Exception as e :
     print("Hata olustu",str(e))
     return jsonify({"hata":str(e)}),500
   
@app.route("/admin/ihale/<ihale_id>/kazanan", methods=["PUT"])
@token_gerektiriyor
@admin_gerektiriyor
def kazanan_teklifi_belirle(ihale_id):
    veri = request.get_json()
    kazanan_teklif_id = veri.get("teklif_id")

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id FROM teklifler 
                WHERE id = :teklif_id AND ihale_id = :ihale_id
            """, {"teklif_id": kazanan_teklif_id, "ihale_id": ihale_id})

            if cursor.fetchone() is None:
                return jsonify({"hata": "Teklif bu ihaleye ait değil"}), 400

            cursor.execute("""
                UPDATE ihaleler
                SET kazanan_teklif_id = :teklif_id
                WHERE id = :ihale_id
            """, {"teklif_id": kazanan_teklif_id, "ihale_id": ihale_id})
            connection.commit()
        return jsonify({"mesaj": "Kazanan teklif başarıyla belirlendi"})
    except Exception as e:
        return jsonify({"hata": str(e)}), 500

@app.route('/admin/ihale/<ihale_id>', methods=["GET"])
@token_gerektiriyor
@admin_gerektiriyor
def get_ihale_detay_admin(ihale_id):
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    i.id,
                    i.baslik,
                    i.aciklama,
                    i.bitis_tarihi,
                    i.kazanan_teklif_id,
                    t.kullanici_id,
                    t.teklif_miktari,
                    TO_CHAR(t.teklif_tarihi, 'YYYY-MM-DD HH24:MI:SS')
                FROM ihaleler i
                LEFT JOIN teklifler t ON i.kazanan_teklif_id = t.id
                WHERE i.id = :id
            """, {"id": ihale_id})

            result = cursor.fetchone()

            if result:
                return {
                    "ihale_id": result[0],
                    "baslik": result[1],
                    "aciklama": result[2],
                    "bitis_tarihi": result[3],
                    "kazanan_teklif": {
                        "id": result[4],
                        "kullanici_id": result[5],
                        "teklif_miktari": result[6],
                        "teklif_tarihi": result[7],
                    } if result[4] else None
                }
            else:
                return {"mesaj": "İhale bulunamadı."}, 404
    except Exception as e:
        print("İhale detay hatası:", e)
        return jsonify({"hata": str(e)}), 500

@app.route("/admin/ihale/<ihale_id>", methods=["PUT"])
@token_gerektiriyor
@admin_gerektiriyor
def ihale_guncelle(ihale_id):
    data = request.json
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE ihaleler
                SET baslik = :baslik,
                    aciklama = :aciklama,
                    baslangic_tarihi = TO_DATE(:baslangic, 'YYYY-MM-DD'),
                    bitis_tarihi = TO_DATE(:bitis, 'YYYY-MM-DD')
                WHERE id = :id
            """, {
                "baslik": data["baslik"],
                "aciklama": data["aciklama"],
                "baslangic": data["baslangic_tarihi"],
                "bitis": data["bitis_tarihi"],
                "id": ihale_id
            })
            connection.commit()
        return jsonify({"mesaj": "İhale başarıyla güncellendi"})
    except Exception as e:
        return jsonify({"hata": str(e)}), 500
    
@app.route("/kullanici/ihale/<ihale_id>/durum", methods=["PUT"])
@token_gerektiriyor
def ihale_durum_guncelle(ihale_id):
    data = request.json
    try:
        aktif_mi = int(data.get("aktif"))
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE ihaleler
                SET aktif = :aktif
                WHERE id = :id
            """, {"aktif": aktif_mi, "id": ihale_id})
            connection.commit()
        return jsonify({"mesaj": "Durum güncellendi"})
    except Exception as e:
        return jsonify({"hata": str(e)}), 500
    



          

 
if __name__ == '__main__':
          app.run(debug=True)


