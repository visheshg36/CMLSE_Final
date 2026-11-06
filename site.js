/* Shared script for every page of the exhibit */
(function(){
  var hooks = [];
  function cur(){ return document.body.classList.contains('lang-hi') ? 'hi' : 'en'; }
  window.EX = { lang: cur, onLang: function(fn){ hooks.push(fn); } };

  window.setLang = function(l){
    document.body.classList.remove('lang-en','lang-hi');
    document.body.classList.add('lang-' + l);
    document.documentElement.lang = l;
    var be = document.getElementById('btn-en'), bh = document.getElementById('btn-hi');
    if(be) be.classList.toggle('on', l === 'en');
    if(bh) bh.classList.toggle('on', l === 'hi');
    try{ localStorage.setItem('exhibit-lang', l); }catch(e){}
    hooks.forEach(function(fn){ try{ fn(l); }catch(e){} });
  };

  /* ---------- Statute close-reading (home page) ---------- */
  var notes = {
    wife:{
      en:"This phrase does the entire exception's work. It does not say consenting adult, or partner. It says wife. The exemption is triggered by a marriage, not by consent, which is the standard the rest of the section uses.",
      hi:"यही वाक्यांश पूरे अपवाद का काम करता है। इसमें सहमति देने वाला वयस्क या साथी नहीं लिखा। लिखा है पत्नी। यह छूट विवाह से सक्रिय होती है, सहमति से नहीं, जबकि यह धारा बाकी हर जगह सहमति की ही कसौटी लगाती है।"
    },
    age:{
      en:"Independent Thought v. Union of India (2017) forced this number up from fifteen to eighteen, so the exception would line up with the law on child sexual offences. The Court read down the age and left the exception standing. An adult wife who lives with her husband still cannot bring a rape charge against him.",
      hi:"इंडिपेंडेंट थॉट बनाम भारत संघ (2017) ने इस संख्या को पंद्रह से बढ़ाकर अठारह कराया, ताकि यह अपवाद बाल यौन अपराध कानून के अनुरूप हो। अदालत ने आयु बदली और अपवाद को यथावत छोड़ दिया। जो वयस्क पत्नी अपने पति के साथ रहती है, वह आज भी उस पर बलात्कार का आरोप नहीं लगा सकती।"
    },
    not:{
      en:"This is the legal outcome. An act that would be rape under every other clause becomes, through these two words, not rape. The husband can still face other charges, such as cruelty, and a wife who lives separately is covered by a separate offence with a lighter sentence. A wife who lives with him cannot call it rape in court.",
      hi:"यही कानूनी परिणाम है। जो कृत्य हर दूसरे खंड के तहत बलात्कार होता, वह इन दो शब्दों से बलात्कार नहीं रह जाता। पति पर क्रूरता जैसे दूसरे आरोप अब भी लग सकते हैं, और अलग रह रही पत्नी के लिए एक अलग, हल्की सज़ा वाला अपराध है। पर जो पत्नी उसके साथ रहती है, वह अदालत में इसे बलात्कार नहीं कह सकती।"
    }
  };
  var curKey = null;
  function paintNote(){
    var n = document.getElementById('siNote');
    if(!n) return;
    n.textContent = curKey ? notes[curKey][cur()] : '';
  }

  /* ---------- Timeline (home page) ---------- */
  var lawData = [
   {y:'1860',t:{en:'The exception is written',hi:'अपवाद लिखा जाता है'},
    b:{en:'The Indian Penal Code defines rape in Section 375 and, in the same section, exempts a husband from prosecution for non consensual sex with his wife above a stated age. It is drafted under colonial law that treated a wife as having given permanent consent at marriage.',
       hi:'भारतीय दंड संहिता धारा 375 में बलात्कार को परिभाषित करती है और उसी धारा में पति को एक निश्चित आयु से ऊपर की पत्नी के साथ बिना सहमति के संबंध पर मुकदमे से छूट देती है। यह उस औपनिवेशिक कानून के तहत लिखा गया जो मानता था कि विवाह के साथ पत्नी ने स्थायी सहमति दे दी है।'}},
   {y:'1971',t:{en:'The Law Commission looks, and says nothing',hi:'विधि आयोग देखता है, और कुछ नहीं कहता'},
    b:{en:'The 42nd Report of the Law Commission discusses the presumption of consent between a husband and wife living together. It makes no recommendation on whether the exception should stay or go.',
       hi:'विधि आयोग की 42वीं रिपोर्ट साथ रह रहे पति-पत्नी के बीच सहमति की धारणा पर चर्चा करती है। अपवाद रहे या हटे, इस पर वह कोई सिफ़ारिश नहीं करती।'}},
   {y:'2000',t:{en:'The Law Commission says no',hi:'विधि आयोग मना करता है'},
    b:{en:'The 172nd Report hears the argument that there is no reason to shield marital rape when other spousal violence is already a crime. It rejects the argument, warning that criminalising it would interfere too much with the institution of marriage.',
       hi:'172वीं रिपोर्ट के सामने यह तर्क आता है कि जब पति-पत्नी के बीच की बाकी हिंसा अपराध है, तो वैवाहिक बलात्कार को बचाने का कोई कारण नहीं। आयोग इसे खारिज करता है, यह चेतावनी देकर कि इससे विवाह संस्था में बहुत अधिक हस्तक्षेप होगा।'}},
   {y:'2013',t:{en:'Verma Committee says repeal. Parliament declines',hi:'वर्मा समिति कहती है हटाओ। संसद नहीं मानती'},
    b:{en:'After the 2012 Delhi gang rape case, the Justice J.S. Verma Committee recommends deleting the exception and says marriage cannot be a shield on the question of consent. The Parliamentary Standing Committee on Home Affairs refuses, saying the family system would come under stress. The 2013 amendment widens the rape law and leaves Exception 2 untouched.',
       hi:'2012 के दिल्ली सामूहिक बलात्कार मामले के बाद न्यायमूर्ति जे.एस. वर्मा समिति अपवाद हटाने की सिफ़ारिश करती है और कहती है कि सहमति के सवाल पर विवाह ढाल नहीं बन सकता। गृह मामलों की संसदीय स्थायी समिति यह कहकर मना कर देती है कि इससे पारिवारिक व्यवस्था पर दबाव पड़ेगा। 2013 का संशोधन बलात्कार कानून को चौड़ा करता है और अपवाद 2 को छोड़ देता है।'}},
   {y:'2017',t:{en:'Independent Thought v. Union of India',hi:'इंडिपेंडेंट थॉट बनाम भारत संघ'},
    b:{en:'The Supreme Court holds that the exception cannot apply where the wife is under 18. This closes a gap for minors. The Court expressly declines to rule on the exception as it applies to adult wives, and the core exemption stands. The same year, the Union files an affidavit in the Delhi High Court opposing criminalisation.',
       hi:'सर्वोच्च न्यायालय कहता है कि पत्नी 18 वर्ष से कम हो तो यह अपवाद लागू नहीं होगा। इससे नाबालिगों के लिए एक खाई भरती है। वयस्क पत्नियों के लिए अपवाद पर अदालत निर्णय देने से स्पष्ट इनकार करती है, और मूल छूट कायम रहती है। उसी वर्ष भारत संघ दिल्ली उच्च न्यायालय में हलफ़नामा दायर कर इसे अपराध बनाने का विरोध करता है।'}},
   {y:'2022',t:{en:'Two High Courts pull in different directions',hi:'दो उच्च न्यायालय, दो अलग दिशाएँ'},
    b:{en:'Early in the year, asked for its stand in the Delhi High Court, the Union says it is reconsidering and asks the court to wait. In March, the Karnataka High Court lets a rape charge against a husband go to trial, holding that the exception is not a licence to commit a crime. In May, in RIT Foundation v. Union of India, the Delhi High Court splits: Justice Rajiv Shakdher strikes the exception down under Article 14, and Justice C. Hari Shankar upholds it as resting on an intelligible differentia. Both cases go to the Supreme Court.',
       hi:'साल की शुरुआत में दिल्ली उच्च न्यायालय में रुख पूछे जाने पर भारत संघ कहता है कि वह पुनर्विचार कर रहा है और अदालत से रुकने को कहता है। मार्च में कर्नाटक उच्च न्यायालय एक पति पर बलात्कार के आरोप को मुकदमे तक जाने देता है, यह कहकर कि अपवाद अपराध करने का लाइसेंस नहीं है। मई में आरआईटी फाउंडेशन बनाम भारत संघ में दिल्ली उच्च न्यायालय बँट जाता है: न्यायमूर्ति राजीव शकधर अनुच्छेद 14 के तहत अपवाद को रद्द करते हैं, और न्यायमूर्ति सी. हरि शंकर इसे बोधगम्य भेद पर आधारित मानकर बरकरार रखते हैं। दोनों मामले सर्वोच्च न्यायालय पहुँचते हैं।'}},
   {y:'2023',t:{en:'Bharatiya Nyaya Sanhita re-enacts it',hi:'भारतीय न्याय संहिता इसे फिर लागू करती है'},
    b:{en:'India replaces the Indian Penal Code with the Bharatiya Nyaya Sanhita. Section 63, Exception 2 carries the marital exception forward with the same structure and the same age threshold. A wholesale rewrite of criminal law was the moment to let it lapse quietly. It was kept instead.',
       hi:'भारत भारतीय दंड संहिता की जगह भारतीय न्याय संहिता लाता है। धारा 63, अपवाद 2 वैवाहिक अपवाद को उसी ढाँचे और उसी आयु-सीमा के साथ आगे ले जाती है। आपराधिक कानून का पूरा पुनर्लेखन वह मौका था जब यह चुपचाप समाप्त हो सकता था। उसे रखा गया।'}},
   {y:'2024',t:{en:'The Union calls it excessively harsh',hi:'केंद्र इसे अत्यधिक कठोर कहता है'},
    b:{en:'On 3 October, the Ministry of Home Affairs files a 49 page affidavit in the Supreme Court. It concedes that a husband has no fundamental right to violate his wife\u2019s consent, then argues that calling it rape would be excessively harsh and that existing laws are enough. The Supreme Court starts hearing the case on 17 October and defers it weeks later, before the Chief Justice retires.',
       hi:'3 अक्टूबर को गृह मंत्रालय सर्वोच्च न्यायालय में 49 पृष्ठ का हलफ़नामा दायर करता है। वह मानता है कि पति को पत्नी की सहमति तोड़ने का कोई मौलिक अधिकार नहीं, फिर तर्क देता है कि इसे बलात्कार कहना अत्यधिक कठोर होगा और मौजूदा कानून काफ़ी हैं। सर्वोच्च न्यायालय 17 अक्टूबर को सुनवाई शुरू करता है और कुछ हफ़्तों बाद, मुख्य न्यायाधीश की सेवानिवृत्ति से पहले, उसे टाल देता है।'}},
   {y:'2026',t:{en:'Listed for final hearing. Still pending',hi:'अंतिम सुनवाई के लिए सूचीबद्ध। अब भी लंबित'},
    b:{en:'On 9 September, a bench led by Chief Justice Surya Kant lists a batch of eight matters for final hearing. It will decide two questions: whether a husband can be prosecuted while the exception survives, and whether the exception is constitutional at all. The Union maintains that this is for Parliament. At the time of writing, there is no verdict.',
       hi:'9 सितंबर को मुख्य न्यायाधीश सूर्य कांत की अध्यक्षता वाली पीठ आठ मामलों के समूह को अंतिम सुनवाई के लिए सूचीबद्ध करती है। वह दो सवाल तय करेगी: क्या अपवाद के रहते पति पर मुकदमा चल सकता है, और क्या अपवाद संवैधानिक है भी। केंद्र का कहना है कि यह संसद का काम है। यह लिखे जाने तक कोई फ़ैसला नहीं आया है।'}}
  ];
  var lawCur = lawData.length - 1;
  function renderLaw(i){
    var det = document.getElementById('lawdet'); if(!det) return;
    lawCur = i;
    document.querySelectorAll('.pt').forEach(function(p){ p.classList.toggle('on', +p.dataset.i === i); });
    var l = cur();
    det.innerHTML = '<strong>' + lawData[i].t[l] + '</strong>' + lawData[i].b[l];
  }

  document.addEventListener('DOMContentLoaded', function(){
    /* statute */
    document.querySelectorAll('.si-strike').forEach(function(el){
      el.addEventListener('click', function(){
        var k = el.dataset.k, isOn = el.classList.contains('struck');
        document.querySelectorAll('.si-strike').forEach(function(x){
          if(x.dataset.k === k) x.classList.toggle('struck', !isOn);
        });
        curKey = isOn ? null : k; paintNote();
      });
    });
    /* timeline */
    var pts = document.getElementById('pts');
    if(pts){
      lawData.forEach(function(d, i){
        var b = document.createElement('button');
        b.className = 'pt'; b.dataset.i = i; b.type = 'button';
        b.innerHTML = '<span class="lnk"></span><span class="y">' + d.y + '</span>';
        b.addEventListener('click', function(){ renderLaw(i); });
        pts.appendChild(b);
      });
      renderLaw(0);
    }
    EX.onLang(function(){ paintNote(); renderLaw(lawCur); });
    var saved = 'en';
    try{ saved = localStorage.getItem('exhibit-lang') || 'en'; }catch(e){}
    setLang(saved === 'hi' ? 'hi' : 'en');
  });
})();
