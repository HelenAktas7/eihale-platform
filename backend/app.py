import jwt
from functools import wraps
from flask import Flask, jsonify, request
from teklif_services import get_teklifler_by_kullanici_id
from flask_cors import CORS
from db import connection
from datetime import datetime, timedelta
import bcrypt
import traceback
import os
import uuid
from werkzeug.utils import secure_filename
from flask import send_from_directory
import traceback
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) 
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
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
            request.decoded_token = decoded_token
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
    update_teklif,
    db_get_user_by_id,
    db_list_auctions_by_creator,
    db_list_distinct_bidded_auctions,
    db_list_won_auctions,
    db_update_profile,
    db_get_password_hash,
    db_update_password_hash,
    get_sonuc_ihaleler
)

SECRET_KEY = 'cok-gizli-anahtarim'

app = Flask(__name__)
CORS(app) 

@app.route('/')
def home():
    return jsonify(message="E-Ihale sistemi basariyla calisiyor!")
FIELD_SPECS = {
    "arac": [
        {"name": "marka", "label": "Marka", "type": "text"},
        {"name": "model", "label": "Model", "type": "text"},
        {"name": "yil", "label": "Yıl", "type": "number"},
        {"name": "km", "label": "Km", "type": "number"},
        {"name": "vites", "label": "Vites", "type": "select", "options": ["Manuel", "Otomatik"]},
        {"name": "yakit", "label": "Yakıt", "type": "select", "options": ["Benzin", "Dizel", "LPG", "Hibrit", "Elektrik"]}
    ],
    "yapi": [
        {"name": "is_turu", "label": "İş Türü", "type": "text"},
        {"name": "metrekare", "label": "Metrekare", "type": "number"},
        {"name": "konum", "label": "Konum", "type": "text"},
        {"name": "tahmini_bedel", "label": "Tahmini Bedel", "type": "number"}
    ],
    "hizmet": [
        {"name": "hizmet_turu", "label": "Hizmet Türü", "type": "text"},
        {"name": "sure_ay", "label": "Süre (Ay)", "type": "number"},
        {"name": "kapsam", "label": "Kapsam", "type": "textarea"}
    ]
}

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

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route("/ihale", methods=["POST"])
@token_gerektiriyor
def ihale_olustur():
    try:
        print("---- İhale oluşturma isteği geldi ----")
        print("Kategori kod:", request.form.get("kategori_id"))

        kullanici_id = request.decoded_token.get("id")

        baslik = request.form.get("baslik")
        aciklama = request.form.get("aciklama")
        konum = request.form.get("konum")
        kategori_kod = request.form.get("kategori_id")

        baslangic_tarihi = request.form.get("baslangic_tarihi")
        bitis_tarihi = request.form.get("bitis_tarihi")

        if baslangic_tarihi:
            baslangic_tarihi = datetime.fromisoformat(baslangic_tarihi)
        if bitis_tarihi:
            bitis_tarihi = datetime.fromisoformat(bitis_tarihi)

        baslangic_bedeli = request.form.get("baslangic_bedeli")
        try:
            baslangic_bedeli = int(baslangic_bedeli) if baslangic_bedeli else None
        except ValueError:
            baslangic_bedeli = None

        cur = connection.cursor()
        cur.execute("SELECT id FROM kategoriler WHERE kod = :kod", {"kod": kategori_kod})
        kategori_id_row = cur.fetchone()
        if not kategori_id_row:
            return jsonify({"hata": "Geçersiz kategori"}), 400
        kategori_id = kategori_id_row[0]

        ihale_id = str(uuid.uuid4())
        cur.execute("""
            INSERT INTO ihaleler 
                (id, baslik, aciklama,konum, baslangic_tarihi, bitis_tarihi, baslangic_bedeli, kategori_id, olusturan_id, aktif)
            VALUES 
                (:id, :baslik, :aciklama,:konum,:baslangic_tarihi, :bitis_tarihi, :baslangic_bedeli, :kategori_id, :olusturan_id, 1)
        """, {
            "id": ihale_id,
            "baslik": baslik,
            "aciklama": aciklama,
            "konum":konum,
            "baslangic_tarihi": baslangic_tarihi,
            "bitis_tarihi": bitis_tarihi,
            "baslangic_bedeli": baslangic_bedeli,
            "kategori_id": kategori_id,
            "olusturan_id": kullanici_id
        })

        if kategori_kod == "arac":
            yil = request.form.get("yil")
            km = request.form.get("km")
            vites = request.form.get("vites")
            yakit_turu = request.form.get("yakit_turu")
            renk=request.form.get("renk")
            cur.execute("""
                INSERT INTO ihale_arac_detaylari (id,ihale_id, yil, km, vites, yakit_turu,renk)
                VALUES (:id,:ihale_id, :yil, :km, :vites, :yakit_turu,:renk)
            """, {
                "id":str(uuid.uuid4()),
                "ihale_id": ihale_id,
                "yil": yil or None,
                "km": km or None,
                "vites": vites or None,
                "yakit_turu": yakit_turu or None,
                "renk":renk or None
            })

        elif kategori_kod == "yapi":
            metrekare = request.form.get("metrekare")
            oda_sayisi = request.form.get("oda_sayisi")
            bina_yasi = request.form.get("bina_yasi")
            cur.execute("""
                INSERT INTO ihale_yapi_detaylari (id,ihale_id, metrekare, oda_sayisi, bina_yasi)
                VALUES (:id,:ihale_id, :metrekare, :oda_sayisi, :bina_yasi)
            """, {
                "id":str(uuid.uuid4()),
                "ihale_id": ihale_id,
                "metrekare": metrekare or None,
                "oda_sayisi": oda_sayisi or None,
                "bina_yasi": bina_yasi or None
            })

        elif kategori_kod == "hizmet":
            hizmet_suresi = request.form.get("hizmet_suresi")
            kapsam = request.form.get("kapsam")
            cur.execute("""
                INSERT INTO ihale_hizmet_detaylari (id,ihale_id, hizmet_suresi, kapsam)
                VALUES (:id,:ihale_id, :hizmet_suresi, :kapsam)
            """, {
                "id":str(uuid.uuid4()),
                "ihale_id": ihale_id,
                "hizmet_suresi": hizmet_suresi or None,
                "kapsam": kapsam or None
            })

        resim_dosyalar = request.files.getlist("resimler")
        print("Gelen dosya sayısı:", len(resim_dosyalar))
        for file in resim_dosyalar:
            if file and file.filename:
                filename = str(uuid.uuid4()) + "_" + file.filename
                file.save(os.path.join(UPLOAD_FOLDER, filename))
                cur.execute("""
                    INSERT INTO ihale_gorselleri (ihale_id, resim_adi)
                    VALUES (:ihale_id, :resim_adi)
                """, {
                    "ihale_id": ihale_id,
                    "resim_adi": filename
                })

        connection.commit()
        cur.close()

        return jsonify({"mesaj": "İhale başarıyla oluşturuldu", "ihale_id": ihale_id}), 201

    except Exception as e:
        traceback.print_exc()  
        return jsonify({"hata": str(e)}), 500




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
import traceback
from flask import jsonify

@app.route('/ihaleler', methods=['GET'])
def tum_ihaleleri_getir():
    try:
        filters = request.args.to_dict()
        ihaleler = get_all_ihaleler(filters)
        if not ihaleler:
            return jsonify({"hata": "Hiç ihale bulunamadı"}), 404
        return jsonify(ihaleler), 200
    except Exception as e:
        print("İhaleler çekme hatası:", e)
        traceback.print_exc()
        return jsonify({"hata": "İhaleler alınamadı"}), 500



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
        return jsonify({"message": "Email ve şifre gerekli"}), 400

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT id, isim, rol, sifre FROM kullanicilar 
            WHERE email = :1
        """, (email,))
        sonuc = cursor.fetchone()
        cursor.close()
        connection.close()

        if sonuc:
            user_id, isim, rol, stored_hash = sonuc

         
            if bcrypt.checkpw(sifre.encode("utf-8"), stored_hash.encode("utf-8")):
                token = jwt.encode({
                    "id": user_id,
                    "isim": isim,
                    "rol": rol,
                    "exp": datetime.now() + timedelta(hours=2)
                }, SECRET_KEY, algorithm="HS256")

                return jsonify({"token": token})
            else:
                return jsonify({"message": "Şifre hatalı"}), 401

        else:
            return jsonify({"message": "Email bulunamadı"}), 401

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
        return jsonify(ihale), 200
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
        filters = request.args.to_dict()
        rows = get_aktif_ihaleler(filters)

        return jsonify([
            {
                "id": r[0],
                "baslik": r[1],
                "aciklama": r[2],
                "konum": r[3],
                "baslangic_bedeli": r[4],
                "bitis_tarihi": str(r[5]),
                "kategori_kod": r[6],
                "yil": r[7],
                "km": r[8],
                "vites": r[9],
                "yakit_turu": r[10],
                "metrekare": r[11],
                "oda_sayisi": r[12],
                "bina_yasi": r[13],
                "hizmet_suresi": r[14],
                "kapsam": r[15],
                "resimler": r[16].split(",") if r[16] else []
            }
            for r in rows
        ])
    except Exception as e:
        print("Filtreleme hatası:", e)
        return jsonify({"hata": str(e)}), 500
    
@app.route('/ihaleler/sonuc', methods=['GET'])
def sonuc_ihaleleri_getir():
    try:
        filters = request.args.to_dict()
        rows = get_sonuc_ihaleler(filters)

        return jsonify([
            {
                "id": r[0],
                "baslik": r[1],
                "aciklama": r[2],
                "konum": r[3],
                "baslangic_bedeli": r[4],
                "bitis_tarihi": str(r[5]),
                "kategori_kod": r[6],
                "yil": r[7],
                "km": r[8],
                "vites": r[9],
                "yakit_turu": r[10],
                "metrekare": r[11],
                "oda_sayisi": r[12],
                "bina_yasi": r[13],
                "hizmet_suresi": r[14],
                "kapsam": r[15],
                "resimler": r[16].split(",") if r[16] else []
            }
            for r in rows
        ])
    except Exception as e:
        print("Sonuçlanan ihaleler hatası:", e)
        return jsonify({"hata": str(e)}), 500



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
    

@app.route("/admin/ihale/<ihale_id>", methods=["DELETE"])
@token_gerektiriyor
def ihale_sil(ihale_id):
    try:
        cur = connection.cursor()

  
        cur.execute("DELETE FROM ihale_gorselleri WHERE ihale_id = :id", {"id": ihale_id})

        cur.execute("DELETE FROM ihale_arac_detaylari WHERE ihale_id = :id", {"id": ihale_id})
        cur.execute("DELETE FROM ihale_yapi_detaylari WHERE ihale_id = :id", {"id": ihale_id})
        cur.execute("DELETE FROM ihale_hizmet_detaylari WHERE ihale_id = :id", {"id": ihale_id})

        cur.execute("DELETE FROM ihaleler WHERE id = :id", {"id": ihale_id})

        connection.commit()
        cur.close()
        return jsonify({"mesaj": "İhale ve bağlı kayıtları silindi"}), 200
    except Exception as e:
        connection.rollback()
        return jsonify({"hata": str(e)}), 500

  
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
@app.route("/kullanici/me", methods=["GET"])
@token_gerektiriyor
def me():
    try:
        kullanici_id = request.decoded_token.get("id")
        user = db_get_user_by_id(kullanici_id)
        if not user:
            return jsonify({"hata": "Kullanici bulunamadi"}), 404
        return jsonify(user)
    except Exception as e:
        return jsonify({"hata": str(e)}), 500

@app.route("/kullanici/ihalelerim", methods=["GET"])
@token_gerektiriyor
def my_auctions():
    try:
        kullanici_id = request.decoded_token.get("id")
        data = db_list_auctions_by_creator(kullanici_id)
        return jsonify(data)
    except Exception as e:
        return jsonify({"hata": str(e)}), 500


@app.route("/kullanici/tekliflerim", methods=["GET"])
@token_gerektiriyor
def my_bids():
    try:
        kullanici_id = request.decoded_token.get("id")
        data = db_list_distinct_bidded_auctions(kullanici_id)
        return jsonify(data)
    except Exception as e:
        return jsonify({"hata": str(e)}), 500

@app.route("/kullanici/kazandiklarim", methods=["GET"])
@token_gerektiriyor
def my_wins():
    try:
        kullanici_id = request.decoded_token.get("id")
        data = db_list_won_auctions(kullanici_id)
        return jsonify(data)
    except Exception as e:
        return jsonify({"hata": str(e)}), 500
@app.route("/kullanici/profil", methods=["GET"])
@token_gerektiriyor
def get_my_profile():
    try:
        kullanici_id = request.decoded_token.get("id")
        cur = connection.cursor()
        cur.execute("""
            SELECT isim, email, telefon
            FROM kullanicilar
            WHERE id = :id
        """, {"id": kullanici_id})
        row = cur.fetchone()
        cur.close()

        if not row:
            return jsonify({"hata": "Kullanici bulunamadi"}), 404

        return jsonify({
            "isim": row[0],
            "email": row[1],
            "telefon": row[2]
        })
    except Exception as e:
        return jsonify({"hata": str(e)}), 500

@app.route("/kullanici/profil", methods=["PUT"])
@token_gerektiriyor
def update_my_profile():
    try:
        kullanici_id = request.decoded_token.get("id")
        body = request.get_json(force=True)

        for field in ("isim", "email", "telefon"):
            if field not in body:
                return jsonify({"hata": f"eksik alan: {field}"}), 400

        db_update_profile(kullanici_id, body["isim"], body["email"], body["telefon"])
        return jsonify({"mesaj": "Profil guncellendi"})
    except Exception as e:
        return jsonify({"hata": str(e)}), 500
@app.route("/kullanici/parola", methods=["PUT"])
@token_gerektiriyor
def change_password():
    try:
        kullanici_id = request.decoded_token.get("id")
        body = request.get_json(force=True)

        old_pass = body.get("eski_sifre")
        new_pass = body.get("yeni_sifre")
        if not old_pass or not new_pass:
            return jsonify({"hata": "eski_sifre ve yeni_sifre gerekli"}), 400

        stored_hash = db_get_password_hash(kullanici_id)
        if not stored_hash:
            return jsonify({"hata": "Kullanici bulunamadi"}), 404

        if not bcrypt.checkpw(old_pass.encode("utf-8"), stored_hash.encode("utf-8")):
            return jsonify({"hata": "Eski sifre yanlis"}), 400

        new_hash = bcrypt.hashpw(new_pass.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        db_update_password_hash(kullanici_id, new_hash)

        return jsonify({"mesaj": "Parola guncellendi"})
    except Exception as e:
        return jsonify({"hata": str(e)}), 500   
@app.route("/kategoriler", methods=["GET"])
def kategoriler():
    cur = connection.cursor()
    cur.execute("SELECT kod, ad FROM kategoriler ORDER BY ad")
    rows = cur.fetchall()
    return jsonify([{"kod": r[0], "ad": r[1]} for r in rows])

@app.route("/kategoriler/<kod>/alanlar", methods=["GET"])
def kategori_alanlar(kod):
    return jsonify(FIELD_SPECS.get(kod, []))

@app.route("/uyeol", methods=["POST"])
def uye_ol():
    try:
        data = request.get_json()
        isim = (data.get("isim") or "").strip()
        soyad = (data.get("soyad") or "").strip()
        email = (data.get("email") or "").strip().lower()
        telefon = (data.get("telefon") or "").strip()
        sifre = data.get("sifre") or ""

        if not isim or not soyad or not email or not sifre:
            return jsonify({"hata": "Zorunlu alanlar eksik."}), 400

        cur = connection.cursor()

        cur.execute("SELECT 1 FROM KULLANICILAR WHERE EMAIL = :e", {"e": email})
        if cur.fetchone():
            return jsonify({"hata": "Bu e-posta ile kayıt zaten var."}), 409

        hashed = bcrypt.hashpw(sifre.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        import uuid
        uid = str(uuid.uuid4())

        cur.execute("""
            INSERT INTO KULLANICILAR (ID, ISIM, SOYAD, EMAIL, TELEFON, SIFRE, ROL)
            VALUES (:id, :isim, :soyad, :email, :telefon, :sifre, :rol)
        """, {
            "id": uid,
            "isim": isim,
            "soyad": soyad,
            "email": email,
            "telefon": telefon,
            "sifre": hashed,
            "rol": "kullanici"
        })
        connection.commit()
        return jsonify({"mesaj": "Kayıt başarılı"}), 201


    except Exception as e:
        connection.rollback()
        print("Üye ol hatası:", e)
        traceback.print_exc()
        return jsonify({"hata": "Sunucu hatası"}), 500


if __name__ == '__main__':
  app.run(debug=True)


