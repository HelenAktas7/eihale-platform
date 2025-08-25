import React from "react";
import AnaNavbar from "../components/AnaNavbar";

function KullaniciSozlesmesi() {
    return (
        <>
            <AnaNavbar />
            <div className="container py-5">
                <h2 className="text-center mb-4">KULLANICI SÖZLEŞMESİ</h2>
                <p className="text-center text-muted mb-5">
                    E-İhale Programı Kullanıcı Sözleşmesi
                </p>

                <div
                    style={{
                        background: "#fff",
                        padding: "2rem",
                        borderRadius: "8px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    }}
                >
                    <ol style={{ lineHeight: "1.8", fontSize: "1rem" }}>
                        <li>
                            Bu sözleşme, elektronik ortamda ihale düzenleyen <b>E-İhale
                                Platformu</b> (“Sistem”) ile sisteme üye olan ve ihalelere katılan
                            <b> Kullanıcı</b> arasında akdedilmiştir.
                        </li>
                        <li>
                            Kullanıcı, bu sözleşmeyi elektronik ortamda onaylamakla birlikte
                            üyeliği devam ettiği sürece sözleşmenin geçerli olduğunu kabul eder.
                        </li>
                        <li>
                            Sisteme 18 yaşını doldurmuş gerçek kişiler ile kanuni temsilcileri
                            aracılığıyla tüzel kişiler üye olabilir. Üyelik sırasında verilen
                            bilgilerin doğruluğundan Kullanıcı sorumludur.
                        </li>
                        <li>
                            Kullanıcı, üyelik formunda beyan ettiği bilgilerin eksik veya yanlış
                            olmasından doğacak tüm sorumluluğun kendisine ait olduğunu kabul
                            eder. Yanıltıcı bilgi verilmesi halinde üyeliği askıya alınabilir.
                        </li>
                        <li>
                            Kullanıcı adı ve şifre kişiye özeldir. Güvenliğinden Kullanıcı
                            sorumludur. Başka kişiler tarafından kullanılmasından doğacak tüm
                            sonuçlar Kullanıcıya aittir.
                        </li>
                        <li>
                            Teklifler yalnızca sistem üzerinden verilir.
                        </li>
                        <li>
                            İhale bitiminde en yüksek teklif veren Kullanıcı kazanan olarak
                            belirlenir. İdare, ihaleyi iptal etme veya kazananı değiştirme hakkını
                            saklı tutar.
                        </li>
                        <li>
                            Kazanan Kullanıcı ödeme yükümlülüğünü ilan edilen süre içerisinde
                            yerine getirmek zorundadır. Ödeme yapılmaması halinde ihale hakkı iptal
                            edilir ve ikinci en yüksek teklif sahibine devredilebilir.
                        </li>
                        <li>
                            Araç ihalelerinde araç teslim noktasında, yapı ihalelerinde tapu devri
                            yoluyla, hizmet ihalelerinde ise sözleşme yapılmak suretiyle teslim
                            gerçekleşir.
                        </li>
                        <li>
                            Kullanıcı, sistemin işleyişini bozacak veya mevzuata aykırı hareket
                            etmeyeceğini peşinen kabul eder. Aksi durumda doğacak tüm hukuki ve
                            cezai sorumluluk kendisine aittir.
                        </li>
                        <li>
                            Platform, hizmetlerde ve ihale sürelerinde değişiklik yapma veya ihaleyi
                            iptal etme hakkını saklı tutar. Bu durumda Kullanıcının teminat dışında
                            herhangi bir talep hakkı bulunmamaktadır.
                        </li>
                        <li>
                            Kullanıcı bilgileri, yalnızca yasal zorunluluk halinde yetkili merciler
                            ile paylaşılabilir. Platform, güvenlik için gerekli tedbirleri alır; ancak
                            teknik aksaklık, erişim kesintisi veya saldırı halinde ihaleyi iptal
                            edebilir.
                        </li>
                        <li>
                            İşbu sözleşmeden doğabilecek ihtilaflarda, sistemin bulunduğu yer
                            mahkemeleri ve icra daireleri yetkilidir.
                        </li>
                        <li>
                            Kullanıcının sisteme üye olması, işbu sözleşmenin tüm hükümlerini
                            okuduğu, anladığı ve kabul ettiği anlamına gelir. Sözleşme üyeliğin
                            onaylandığı anda yürürlüğe girer.
                        </li>
                    </ol>
                </div>
            </div>
        </>
    );
}

export default KullaniciSozlesmesi;
