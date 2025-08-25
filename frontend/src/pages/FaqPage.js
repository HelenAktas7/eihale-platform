import React, { useState } from "react";
import AnaNavbar from "../components/AnaNavbar";

const faqData = [
    { question: "Elektronik ihalenin yasal dayanağı nedir?", answer: "Tasfiyelik hale gelmiş eşyanın tasfiyesi amacıyla elektronik ortamda yapılacak ihalelere ilişkin düzenlenmiş bu şartnamenin dayanağı Tasfiye Yönetmeliği ve Tasfiye Genel Tebliği (Elektronik İhale Seri No:1) ile Tasfiye Genel Tebliği (Elektronik İhale Seri No: 1)’nde Değişiklik Yapılmasına Dair Tebliğ (Elektronik İhale Seri No: 2)’dir." },
    { question: "Kimler e ihaleye üye olabilir?", answer: "18 yaşını doldurmuş, medeni hakları kullanma ehliyetine sahip ve kanuni ikametgahı bulunan herkes ihalelere katılabilir." },
    { question: "Yasak fiil ve yaptırımlar nelerdir?", answer: "(1) İhalelerde hile, desise, vaat, tehdit, nüfuz kullanma ve çıkar sağlama suretiyle veya başka yollarla ihaleye ilişkin işlemlere fesat karıştıranlar veya buna teşebbüs edenler, isteklileri tereddüde düşürecek veya rağbeti kıracak söz söyleyenler ve istekliler arasında anlaşmaya çağrıyı ima edecek, rekabeti ya da ihale kararını etkileyecek işaret ve davranışlarda bulunanlar veya ihalenin doğruluğunu bozacak biçimde görüşme ve tartışma yapanlar, sahte belge ve sahte teminat kullananlar veya kullanmaya teşebbüs edenler, taahhüdünü kötü niyetle yerine getirmeyenler, taahhüdünü yerine getirirken idareye zarar verecek işler yapanlar, artırma üzerinde kaldığı halde satış kâğıdını imzalamayanlar komisyon kararıyla ihale salonundan derhal çıkarılır ve teminatları döner sermayeye gelir kaydedilir. (2) Birinci fıkrada belirtilen fiilleri bizzat veya bilvekale işleyenlerle bu işteki vekil veya müvekkilleri hakkında fiilin özelliğine göre Genel Müdürlük tarafından bir yıla kadar işletme müdürlüklerinin ihalelerine katılmaktan yasaklama kararı verilir. Bunların sermayesinin çoğunluğuna sahip bulunduğu veya yönetim kurulunda görev aldığı tespit edilen tüzel kişiler için de yasaklama kararı alınır. (3) Tasfiye Yönetmeliği kapsamındaki ihalelerde, 38 inci maddenin ikinci fıkrasının (d) bendi uyarınca teminat bedelini tamamlayanlar hariç olmak üzere alıcı veya vekilinin teminatı yeterli olmadığı halde pey sürdüğü veya ihale bedelini ödemediği tarihten itibaren geriye doğru bir yıl içinde bu fiillerden birini, a) Bir ihalede daha işlemiş ise altı ay, b) İki veya daha fazla ihalede işlemiş ise bir yıl, süresince işletme müdürlüklerince yapılan ihalelere alınmaz. (4) İhaleyi yapan işletme müdürlüğünce, ihalelere katılmaktan yasaklama kararı verilmesi gerekenlere, ihale bedelini ödemeyenlere ve teminat bedeli yeterli olmadığı halde pey sürenlere ilişkin bilgiler, elektronik ortamda duyurusu yapılmak üzere Genel Müdürlüğe gönderilir. (5) İkinci ve üçüncü fıkralarda belirtilen fiil ve davranışların tespit edildiği tarihi izleyen on iş günü içinde yasaklama kararı alınarak elektronik ortamda duyurulur. (6) Haklarında ihaleye katılmaktan yasaklama kararı bulunanlar, yasaklama kararının sona erdiği tarihe kadar işletme müdürlüklerince yapılacak ihalelere iştirak ettirilmezler. Bu konuda gerekli tedbirler işletme müdürlüklerince alınır. (7) İhale işlemlerinde sahte belge veya sahte teminat kullanan veya kullanmaya teşebbüs eden, taahhüdünü kötü niyetle yerine getirmeyen, taahhüdünü yerine getirirken idareye zarar verecek işler yapan, ihale işlemlerine fesat karıştıran veya teşebbüs edenler ile o işteki ortak veya vekilleri hakkında Cumhuriyet Savcılığına suç duyurusunda bulunulur. (8) (Değişik:RG-31/12/2019-30995 4.Mükerrer) Yasaklılık haline sebep olan fiilden önce yapılan işlemlere ilişkin ödeme, teslim ve diğer işlemler hariç olmak üzere, bu maddenin ikinci ve üçüncü fıkraları ile 43 üncü madde kapsamında ihaleye katılamayacak olanlar idarece yapılan ihalelere ilişkin, eşyanın görülmesi de dahil hiç bir işlem yapamaz ve eylemde bulunamazlar." },
    { question: "e ihaleye kimler katılamaz?", answer: "İstekli veya vekil sıfatıyla işletme müdürlüklerine yapılacak ihalelere; a) İhalelere katılmaktan yasaklananlar, b) Tüm Bakanlık personeli ile bunların eşleri ve birinci dereceye kadar (birinci derece dahil) kan ve sıhri hısımları, (a) ve (b) bentlerinde sayılan şahısların sermayesinin çoğunluğuna sahip bulunduğu tüzel kişiler veya yönetim kurulunda görev aldığı tüzel kişiler, katılamazlar. (2) İşletme müdürlüğünde görevli iken bu görevlerinden ayrılmış olanlar görevlerinden ayrıldıkları tarihten itibaren yapılacak ihalelere bir yıl süreyle giremezler." },
    { question: "Üye olmadan ihalelere katılabilir miyim?", answer: "Ana sayfadan “Güncel İhaleler” bölümünü tıkladığınızda üye olmadan da ihalesi yapılacak araç ve eşya bilgilerini görebilirsiniz. Diğer taraftan açık teklif usulü ile ihalelere verilen teklifleri anlık olarak görüntüleyebilmek için üyelik hesabınızla giriş yapmanız gerekmektedir." },
    { question: "Elektronik ihaleye girebilmek için ne yapmam gerekiyor?", answer: "Gerçek Kişi Üyelik İşlemleri: Elektronik ihaleye girebilmek için ana sayfadaki “Üye ol” bölümünden kayıt olunması gerekmektedir." },
    { question: "Sisteme üyelik için herhangi bir ücret ödenmesi gerekiyor mu?", answer: "Sisteme üyelik ücretsizdir. Ancak ihalelere teklif verebilmek için yeterli teminata sahip olmak gerekmektedir." },
    { question: "Başka kullanıcı otomatik teklif tutarım kadar teklif verirse ne olur?", answer: "Bir başka kullanıcı artırım yoluyla yada otomatik teklif yoluyla sizinle aynı teklifi verirse, sistemde daha önce teklif veren kullanıcının teklifi en yüksek teklif olarak kabul edilir. Sonradan teklif veren kullanıcı aynı bedelle ikinci en yüksek teklif sahibi olur." },
    { question: "Otomatik teklifimi iptal etmek/değiştirmek istiyorum", answer: "Otomatik teklifinizi istediğiniz zaman iptal edebilirsiniz. İptal işleminden sonra sistem tekliflerinizi arttırmaya devam etmeyecektir. Ancak iptal işlemine kadar vermiş olduğunuz teklifler geçerli olacaktır. Aynı şekilde vermiş olduğunuz otomatik teklif miktarını değiştirmek istiyorsanız mevcut otomatik teklifinizi iptal ettikten sonra istediğiniz tutarda yeni bir otomatik teklif verebilirsiniz." },
    { question: "İhaleyi kazandığımı nasıl öğrenebilirim?", answer: "“Sonuçlanan ihaleler” sayfasından ihale sonucunu takip edebilirsiniz. İhaleyi kazanmanız halinde tarafınıza ayrıca e-posta/SMS ile bilgilendirme yapılacaktır." },
    { question: "Kazandığım ihalenin bedelini nasıl ödeyeceğim?", answer: "İhaleyi kazandıktan sonra bildirilen ihale bedelini 'İhalelerim' sayfasında yer alan 'Öde' butonuna basarak yapmanız gerekmektedir. " },
    {
        question: "İhalesini kazandığım aracı nasıl teslim alabilirim?",
        answer: "İhaleyi kazandıktan sonra ödeme işleminizi belirtilen süre içerisinde tamamlamanız gerekir. Ödeme onaylandıktan sonra araç, ilgili kurumun otoparkında veya teslim noktasında tarafınıza teslim edilir. Araç ruhsat ve tescil işlemleri de kurum tarafından düzenlenerek tarafınıza verilir."
    },
    {
        question: "İhalesini kazandığım yapıyı (villa, ev) nasıl teslim alabilirim?",
        answer: "İhaleyi kazandıktan ve ödeme işlemlerini tamamladıktan sonra ilgili kurum sizin adınıza tapu devri için gerekli süreci başlatır. Tapu işlemleri tamamlandığında yapı resmi olarak adınıza geçer ve kullanımınıza açılır."
    }
];

export default function FaqPage() {
    const [open, setOpen] = useState(null);
    const toggle = (i) => setOpen(open === i ? null : i);

    return (
        <>
            <AnaNavbar />
            <div className="container py-5">
                <h2 className="text-center mb-2">SIKÇA SORULAN SORULAR</h2>
                <p className="text-center text-muted mb-4">
                    Cevabı görmek için bir soruya tıklayın.
                </p>

                <div className="accordion">
                    {faqData.map((item, i) => (
                        <div key={i} className="card mb-2 shadow-sm" style={{ borderRadius: 8 }}>
                            <button
                                className="card-header d-flex justify-content-between align-items-center w-100 text-start"
                                style={{ background: "#f8f9fa", cursor: "pointer", border: "none" }}
                                onClick={() => toggle(i)}
                            >
                                <span style={{ fontWeight: 600 }}>{item.question}</span>
                                <span>{open === i ? "▲" : "▼"}</span>
                            </button>

                            {open === i && (
                                <div className="card-body">
                                    {item.answer ? (
                                        <p className="mb-0">{item.answer}</p>
                                    ) : (
                                        <em className="text-muted">Cevabı buraya ekleyin…</em>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
