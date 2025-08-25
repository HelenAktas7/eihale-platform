import React from "react";
import AnaNavbar from "../components/AnaNavbar";

function GenelSartlar() {
    return (
        <>
            <AnaNavbar />
            <div className="container py-5">
                <h2 className="text-center mb-4">GENEL ŞARTLAR</h2>
                <p className="text-center text-muted mb-5">
                    E-İhale Platformu Genel Şartları aşağıda yer almaktadır.
                </p>

                <div style={{ background: "#fff", padding: "2rem", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
                    <ol style={{ lineHeight: "1.8", fontSize: "1rem" }}>
                        <li>Kullanıcı, üyelik formunu doldurarak sisteme kayıt olmasıyla birlikte, formda yer alan tüm bilgilerin doğru, eksiksiz ve kendisine ait olduğunu beyan ve taahhüt etmiş sayılır.</li>
                        <li>Sistemde yer alan ihaleler, mevcut haliyle ve ilan edilen şartlarla satışa sunulur. Kullanıcı, ihaleye katılarak ihale konusu mal veya hizmeti mevcut durumu ile kabul etmiş sayılır.</li>
                        <li>İhalelere yalnızca sisteme kayıtlı ve giriş yapmış kullanıcılar katılabilir.</li>
                        <li>Teklifler yalnızca sistem üzerinden verilebilir.</li>
                        <li>İhale süresi sonunda, en yüksek teklif veren kullanıcı kazanan olarak belirlenir.</li>
                        <li>İhale sonucunda kazanan kullanıcı, ödeme yükümlülüğünü ilan edilen süre ve koşullara uygun şekilde yerine getirmek zorundadır.</li>
                        <li>Araç ihalelerinde araç, belirlenen teslim noktasında kullanıcıya teslim edilir. Yapı ihalelerinde tapu devri ilgili mevzuat hükümleri çerçevesinde gerçekleştirilir.</li>
                        <li>Sistem, teknik bir arıza, hukuka aykırılık veya kullanıcı tarafından şartların ihlali halinde, ihaleyi durdurma, iptal etme veya geçersiz kılma hakkını saklı tutar.</li>
                        <li>Kullanıcı, sisteme üye olmakla birlikte bu Genel Şartlar’ı kabul etmiş sayılır.</li>
                    </ol>
                </div>
            </div>
        </>
    );
}

export default GenelSartlar;
