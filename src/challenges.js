// ═══════════════════════════════════════════════════════════════
// challenges.js — All problems from 6 PPTXs + Sipser textbook
// Each challenge: { id, tp, dif, tit, desc, src, ...typeSpecific }
//
// Types:
//   dfa/nfa  → { a:[], tc:[[inp,bool]], ref:{S,T}, h:[] }
//   re       → { ans, expl }
//   re_mem   → { re, mem:[], non:[] }
//   re_nfa   → { re, steps:[] }
//   gnfa     → { ans, steps:[] }
//   pl       → { s, part, pump, contr }
//   cfg      → { gram, deriv?, expl }
//   pda      → { transitions:[], expl }
//   cfl_pl   → { s, part, pump, contr }
//   tm       → { expl }
// ═══════════════════════════════════════════════════════════════

// ─── DFA (10 problems) ─────────────────────────────────────
const DFA = [
  { id:"d1", tit:"\"ab\" Alt Stringi İçeren", desc:"L = { w ∈ {a,b}* : w \"ab\" içerir }\nKabul: ab, aab, bab | Red: a, ba, bbb", a:["a","b"],
    tc:[["ab",1],["aab",1],["bab",1],["abba",1],["a",0],["ba",0],["bbb",0],["",0]],
    ref:{S:[["q0",1,0],["q1",0,0],["q2",0,1]], T:[["q0","a","q1"],["q0","b","q0"],["q1","a","q1"],["q1","b","q2"],["q2","a","q2"],["q2","b","q2"]]},
    h:["3 durum: hiç a görmemiş / a gördü / ab gördü","q₂ trap durum: ab bulununca her şeyi kabul eder"], src:"DFA-1" },
  { id:"d2", tit:"\"bb\" ile Biten", desc:"L = { w ∈ {a,b}* : w \"bb\" ile biter }", a:["a","b"],
    tc:[["bb",1],["abb",1],["bbb",1],["b",0],["ab",0],["bba",0],["",0]],
    ref:{S:[["q0",1,0],["q1",0,0],["q2",0,1]], T:[["q0","a","q0"],["q0","b","q1"],["q1","a","q0"],["q1","b","q2"],["q2","a","q0"],["q2","b","q2"]]},
    h:["Son okunan karakterleri takip et: 0b / 1b / 2+b"], src:"DFA-2" },
  { id:"d3", tit:"|w| mod 3 = 0", desc:"L = { w ∈ {a,b}* : |w| mod 3 = 0 }\nε kabul!", a:["a","b"],
    tc:[["",1],["aaa",1],["aaabbb",1],["a",0],["ab",0],["aabb",0]],
    ref:{S:[["q0",1,1],["q1",0,0],["q2",0,0]], T:[["q0","a","q1"],["q0","b","q1"],["q1","a","q2"],["q1","b","q2"],["q2","a","q0"],["q2","b","q0"]]},
    h:["3 durum döngüsü: mod0 → mod1 → mod2 → mod0. Sembol önemsiz!"], src:"DFA-3" },
  { id:"d4", tit:"\"a\" ile Başlayan", desc:"L = { w ∈ {a,b}* : w \"a\" ile başlar }", a:["a","b"],
    tc:[["a",1],["ab",1],["aabb",1],["",0],["b",0],["ba",0]],
    ref:{S:[["q0",1,0],["q1",0,1],["q2",0,0]], T:[["q0","a","q1"],["q0","b","q2"],["q1","a","q1"],["q1","b","q1"],["q2","a","q2"],["q2","b","q2"]]},
    h:["İlk karakter belirleyici. Sonrası önemsiz."], src:"DFA-4" },
  { id:"d5", tit:"|w| ≤ 3", desc:"L = { w : |w| ≤ 3 }", a:["a","b"],
    tc:[["",1],["a",1],["aaa",1],["aaaa",0],["abab",0]],
    ref:{S:[["q0",1,1],["q1",0,1],["q2",0,1],["q3",0,1],["q4",0,0]], T:[["q0","a","q1"],["q0","b","q1"],["q1","a","q2"],["q1","b","q2"],["q2","a","q3"],["q2","b","q3"],["q3","a","q4"],["q3","b","q4"],["q4","a","q4"],["q4","b","q4"]]},
    h:["5 durum: sayaç 0→1→2→3→ölü. q₀–q₃ kabul."], src:"DFA-5" },
  { id:"d6", tit:"En Az Bir a ve Bir b", desc:"L = { w : en az 1 a ve 1 b içerir }", a:["a","b"],
    tc:[["ab",1],["ba",1],["aab",1],["a",0],["bbb",0],["",0]],
    ref:{S:[["q0",1,0],["q1",0,0],["q2",0,0],["q3",0,1]], T:[["q0","a","q1"],["q0","b","q2"],["q1","a","q1"],["q1","b","q3"],["q2","a","q3"],["q2","b","q2"],["q3","a","q3"],["q3","b","q3"]]},
    h:["Kartezyen çarpım: {a gördü?} × {b gördü?} = 4 durum","q₃ = ikisini de gördü → trap accept"], src:"DFA-6" },
  { id:"d7", tit:"Tek Sayıda b", desc:"L = { w ∈ {a,b}* : #b tek }", a:["a","b"],
    tc:[["b",1],["ab",1],["bab",1],["",0],["bb",0],["aabb",0]],
    ref:{S:[["q0",1,0],["q1",0,1]], T:[["q0","a","q0"],["q0","b","q1"],["q1","a","q1"],["q1","b","q0"]]},
    h:["2 durum: çift/tek. 'b' toggle, 'a' self-loop","Minimal DFA!"], src:"DFA-7" },
  { id:"d8", tit:"\"aba\" İçermeyen", desc:"L = { w : w \"aba\" alt stringi İÇERMEZ }", a:["a","b"], dif:2,
    tc:[["",1],["ab",1],["aabb",1],["aba",0],["abab",0],["baba",0]],
    ref:{S:[["q0",1,1],["q1",0,1],["q2",0,1],["q3",0,0]], T:[["q0","a","q1"],["q0","b","q0"],["q1","a","q1"],["q1","b","q2"],["q2","a","q3"],["q2","b","q0"],["q3","a","q3"],["q3","b","q3"]]},
    h:["Tümleyen: önce 'aba İÇEREN' DFA yap, sonra kabul↔red değiştir","q₃ = aba bulundu → ölü durum"], src:"DFA-8" },
  { id:"d9", tit:"|w| = 2 veya 3", desc:"L = { w : |w| = 2 veya |w| = 3 }", a:["a","b"],
    tc:[["aa",1],["aaa",1],["bba",1],["a",0],["",0],["aaaa",0]],
    ref:{S:[["q0",1,0],["q1",0,0],["q2",0,1],["q3",0,1],["q4",0,0]], T:[["q0","a","q1"],["q0","b","q1"],["q1","a","q2"],["q1","b","q2"],["q2","a","q3"],["q2","b","q3"],["q3","a","q4"],["q3","b","q4"],["q4","a","q4"],["q4","b","q4"]]},
    h:["q₂ ve q₃ kabul durumları. q₄ ölü durum."], src:"DFA-9" },
  { id:"d10", tit:"2'ye Bölünebilen İkili", desc:"L = { w ∈ {0,1}* : ikili sayı 2'nin katı }\nSon bit 0 → çift", a:["0","1"],
    tc:[["0",1],["10",1],["100",1],["1",0],["11",0],["101",0]],
    ref:{S:[["q0",1,1],["q1",0,0]], T:[["q0","0","q0"],["q0","1","q1"],["q1","0","q0"],["q1","1","q1"]]},
    h:["Sadece son bit önemli! 0→çift, 1→tek. 2 durum yeterli."], src:"DFA-10" },
].map(d=>({...d, tp:"dfa", dif:d.dif||1, module:"m1"}));

// ─── NFA (12 problems) ─────────────────────────────────────
const NFA = [
  { id:"n1", tit:"Sonu 00 (NFA)", desc:"L = { w ∈ {0,1}* : w 00 ile biter }", a:["0","1"],
    tc:[["00",1],["100",1],["000",1],["0",0],["01",0],["",0]],
    ref:{S:[["q0",1,0],["q1",0,0],["q2",0,1]], T:[["q0","0","q0"],["q0","1","q0"],["q0","0","q1"],["q1","0","q2"]]},
    h:["q₀'da kal + nondeterministik tahmin: son 2 sembol 00 mı?","NFA'nın gücü: \"tahmin\" edebilir!"], src:"1.7a" },
  { id:"n2", tit:"0101 İçerir (NFA)", desc:"L = { w : w 0101 alt stringi içerir }", a:["0","1"], dif:2,
    tc:[["0101",1],["00101",1],["01011",1],["010",0],["0110",0],["",0]],
    ref:{S:[["q0",1,0],["q1",0,0],["q2",0,0],["q3",0,0],["q4",0,1]], T:[["q0","0","q0"],["q0","1","q0"],["q0","0","q1"],["q1","1","q2"],["q2","0","q3"],["q3","1","q4"],["q4","0","q4"],["q4","1","q4"]]},
    h:["q₀: her şeyi oku + nondeterministik olarak q₁'e dallan","q₄ trap accept: 0101 bulunduktan sonra her şey kabul"], src:"1.7b" },
  { id:"n3", tit:"Çift 0 VEYA Tam 2 Adet 1", desc:"L = { w : #0 çift ∨ #1=2 }", a:["0","1"], dif:3,
    tc:[["",1],["00",1],["11",1],["0011",1],["0",0],["111",1],["000",0],["10",0]],
    ref:{S:[["q0",1,0],["q1",0,1],["q2",0,0],["q3",0,0],["q4",0,0],["q5",0,1],["q6",0,0]], T:[["q0","ε","q1"],["q0","ε","q3"],["q1","0","q2"],["q1","1","q1"],["q2","0","q1"],["q2","1","q2"],["q3","0","q3"],["q3","1","q4"],["q4","0","q4"],["q4","1","q5"],["q5","0","q5"],["q5","1","q6"],["q6","0","q6"],["q6","1","q6"]]},
    h:["ε ile dallanma: 2 ayrı NFA","Dal 1 (q₁-q₂): çift 0 sayacı | Dal 2 (q₃-q₅): tam 2 bir, q₆=trap(>2)"], src:"1.7c" },
  { id:"n4", tit:"{0} Dili", desc:"Sadece '0' stringini kabul et", a:["0","1"],
    tc:[["0",1],["",0],["1",0],["00",0]],
    ref:{S:[["q0",1,0],["q1",0,1]], T:[["q0","0","q1"]]},
    h:["2 durum, tek geçiş. Minimal NFA."], src:"1.7d" },
  { id:"n5", tit:"0*1*0⁺", desc:"L = 0*1*0⁺ (en az bir 0 ile bitmeli)", a:["0","1"], dif:2,
    tc:[["0",1],["10",1],["010",1],["0110",1],["01",0],["1",0],["",0]],
    ref:{S:[["q0",1,0],["q1",0,0],["q2",0,1]], T:[["q0","0","q0"],["q0","ε","q1"],["q1","1","q1"],["q1","0","q2"],["q2","0","q2"]]},
    h:["3 faz: 0* → ε ile → 1* → 0⁺","ε-geçiş faz değişikliğini modeller"], src:"1.7e" },
  { id:"n6", tit:"1*(001⁺)*", desc:"L = 1*(001⁺)*", a:["0","1"],
    tc:[["",1],["1",1],["11",1],["001",1],["10011",1],["0",0],["00",0]],
    ref:{S:[["q0",1,1],["q1",0,0],["q2",0,0]], T:[["q0","1","q0"],["q0","0","q1"],["q1","0","q2"],["q2","1","q2"],["q2","1","q0"]]},
    h:["q₀ hem başlangıç hem kabul","q₀→0→q₁→0→q₂→1→q₀ döngüsü = 001⁺"], src:"1.7f" },
  { id:"n7", tit:"{ε} Dili", desc:"Sadece boş string ε kabul", a:["0","1"],
    tc:[["",1],["0",0],["1",0]],
    ref:{S:[["q0",1,1]], T:[]},
    h:["Tek durum: başlangıç + kabul. Geçiş yok → sadece ε."], src:"1.7g" },
  { id:"n8", tit:"0*", desc:"L = 0* (sıfır veya daha fazla 0)", a:["0","1"],
    tc:[["",1],["0",1],["000",1],["1",0],["01",0]],
    ref:{S:[["q0",1,1]], T:[["q0","0","q0"]]},
    h:["Self-loop: 0 oku. 1 → sıkışma (NFA'da ölüm)."], src:"1.7h" },
  { id:"n9", tit:"Birleşim: (1…0) ∪ (≥3×1)", desc:"L = {1 ile başlar 0 ile biter} ∪ {en az 3 bir}", a:["0","1"], dif:2,
    tc:[["10",1],["111",1],["1110",1],["",0],["1",0],["11",0],["100",1],["0111",1]],
    ref:{S:[["q0",1,0],["s0",0,0],["s1",0,0],["s2",0,1],["t0",0,0],["t1",0,0],["t2",0,0],["t3",0,1]],
      T:[["q0","ε","s0"],["q0","ε","t0"],["s0","1","s1"],["s1","0","s1"],["s1","1","s1"],["s1","0","s2"],
        ["t0","0","t0"],["t0","1","t1"],["t1","0","t1"],["t1","1","t2"],["t2","0","t2"],["t2","1","t3"],["t3","0","t3"],["t3","1","t3"]]},
    h:["Teorem 1.45: q₀ → ε → NFA₁(s0-s2), ε → NFA₂(t0-t3)","NFA₁: s0→1→s1→0,1→s1, s1→0→s2(kabul) | NFA₂: ≥3 bir sayacı"], src:"1.8a" },
  { id:"n10", tit:"Birleştirme: (≥3×1) ∘ ∅ = ∅", desc:"L = {en az 3 bir} ∘ ∅ = ∅\nA ∘ ∅ = ∅ her dil A için!", a:["0","1"],
    tc:[["",0],["111",0],["0",0]],
    ref:{S:[["q0",1,0]], T:[]},
    h:["∅ ile birleştirme = ∅. Kabul durumu yok!","A ∘ ∅ = ∅, A ∘ {ε} = A"], src:"1.9b" },
  { id:"n11", tit:"(0101 içerir) ∪ (110 içermez)", desc:"L₁ = 0101 alt string | L₂ = 110 yok", a:["0","1"], dif:3,
    tc:[["",1],["0101",1],["010",1],["1100",0],["0",1],["1",1],["110",0],["111",1],["01010",1],["00110",0]],
    ref:{S:[["q0",1,0],["u0",0,0],["u1",0,0],["u2",0,0],["u3",0,0],["u4",0,1],["v0",0,1],["v1",0,1],["v2",0,1],["v3",0,0]],
      T:[["q0","ε","u0"],["q0","ε","v0"],
        ["u0","0","u0"],["u0","1","u0"],["u0","0","u1"],["u1","1","u2"],["u2","0","u3"],["u3","1","u4"],["u4","0","u4"],["u4","1","u4"],
        ["v0","0","v0"],["v0","1","v1"],["v1","0","v0"],["v1","1","v2"],["v2","0","v3"],["v2","1","v2"],["v3","0","v3"],["v3","1","v3"]]},
    h:["10 durum: q₀ → ε → NFA₁(u0-u4: 0101 arar), ε → NFA₂(v0-v3: 110 DFA, v3=trap)","NFA₁ nondeterministik: u0'da self-loop + 0→u1 eşzamanlı"], src:"1.8b" },
  { id:"n12", tit:"(|w|≤5) ∘ (tek pos.=1)", desc:"L₁ = |w|≤5, L₂ = tek pozisyonlar 1\nBirleştirme: L₁∘L₂ = {xy : x∈L₁, y∈L₂}", a:["0","1"], dif:3,
    tc:[["",1],["1",1],["10",1],["0",1],["00000",1],["000001",1],["000000",0],["0000000",0]],
    ref:{S:[["a0",1,0],["a1",0,0],["a2",0,0],["a3",0,0],["a4",0,0],["a5",0,0],["b0",0,1],["b1",0,1]],
      T:[["a0","0","a1"],["a0","1","a1"],["a1","0","a2"],["a1","1","a2"],["a2","0","a3"],["a2","1","a3"],["a3","0","a4"],["a3","1","a4"],["a4","0","a5"],["a4","1","a5"],
        ["a0","ε","b0"],["a1","ε","b0"],["a2","ε","b0"],["a3","ε","b0"],["a4","ε","b0"],["a5","ε","b0"],
        ["b0","1","b1"],["b1","0","b0"],["b1","1","b0"]]},
    h:["Teorem 1.47: NFA₁(a0-a5) kabul durumlarından ε ile NFA₂(b0-b1) başlangıcına","NFA₁: 6 durumluk zincir (|w|≤5), NFA₂: 2 durum (tek=1 döngüsü)","Dikkat: |w|≤5 olan her string kabul (x=w, y=ε∈L₂)"], src:"1.9a" },
].map(d=>({...d, tp:"nfa", dif:d.dif||1, module:"m2"}));

// ─── RE Construction (24 problems) ──────────────────────────
const RE = [
  { id:"r1", tit:"a*b* (Önce a Sonra b)", desc:"L = { aⁿbᵐ | n,m ≥ 0 }", ans:"a*b*", expl:"a* → sıfır+ a, b* → sıfır+ b. Karışık sıralama KABUL EDİLMEZ.", src:"RE-1" },
  { id:"r2", tit:"Σ* (Tüm Stringler)", desc:"L = {a,b}*", ans:"(a ∪ b)*", expl:"(a∪b) = Σ = herhangi sembol, * = sıfır+ tekrar.", src:"RE-2" },
  { id:"r3", tit:"\"ab\" ile Biten", desc:"L = { w : w \"ab\" ile biter }", ans:"(a ∪ b)*ab", expl:"Σ*ab — herhangi önek + zorunlu \"ab\" soneki.", src:"RE-3" },
  { id:"r4", tit:"En Az Bir 'a' İçeren", desc:"L = { w : w en az bir a içerir }", ans:"(a ∪ b)*a(a ∪ b)*", expl:"Σ*aΣ* — ortadaki zorunlu 'a' en az bir tane garanti eder.", src:"RE-4" },
  { id:"r5", tit:"Tam 2 Adet a", desc:"L = { w : #a=2 }", ans:"b*ab*ab*", expl:"DİKKAT: (a∪b)*a(a∪b)*a(a∪b)* YANLIŞ — fazla a girebilir! Sadece b* kullan.", src:"RE-5", dif:2 },
  { id:"r6", tit:"Çift Uzunluk", desc:"L = { w : |w| mod 2 = 0 }", ans:"((a ∪ b)(a ∪ b))*", expl:"(ΣΣ)* → 0, 2, 4, 6,... uzunluk.", src:"RE-6" },
  { id:"r7", tit:"a-Baş veya b-Son", desc:"L = { w : 'a' ile başlar ∨ 'b' ile biter }", ans:"a(a∪b)* ∪ (a∪b)*b", expl:"İki dalın birleşimi.", src:"RE-7", dif:2 },
  { id:"r8", tit:"{ab, ba}", desc:"Sonlu küme", ans:"ab ∪ ba", expl:"Sonlu dil → doğrudan listele. * yok.", src:"RE-8" },
  { id:"r9", tit:"\"aba\" İçerir", desc:"L = { w : \"aba\" ⊆ w }", ans:"(a∪b)*aba(a∪b)*", expl:"Genel alt string kalıbı: Σ*[pattern]Σ*.", src:"RE-9" },
  { id:"r10", tit:"1-Baş 0-Son", desc:"L = { w ∈ {0,1}* : 1…0 }", ans:"1(0∪1)*0", expl:"Zorunlu 1 başlangıç + serbest orta + zorunlu 0 son.", src:"RE-10" },
  // Sipser 1.18 a-n
  { id:"r18b", tit:"≥3 Adet 1", desc:"L = { w : #1 ≥ 3 }", ans:"(0∪1)*1(0∪1)*1(0∪1)*1(0∪1)*", expl:"3 zorunlu '1', aralarında herhangi şey.", src:"1.18b", dif:2 },
  { id:"r18c", tit:"0101 İçerir (RE)", desc:"L = { w : 0101 ⊆ w }", ans:"(0∪1)*0101(0∪1)*", expl:"Standart alt string kalıbı.", src:"1.18c" },
  { id:"r18d", tit:"3. Sembol 0", desc:"L = { w : |w|≥3, w₃=0 }", ans:"(0∪1)(0∪1)0(0∪1)*", expl:"İlk 2 serbest, 3. zorunlu 0.", src:"1.18d" },
  { id:"r18e", tit:"0+tek veya 1+çift", desc:"L = { w : (0-baş ∧ tek) ∨ (1-baş ∧ çift) }", ans:"0((0∪1)(0∪1))* ∪ 1(0∪1)((0∪1)(0∪1))*", src:"1.18e", dif:2 },
  { id:"r18f", tit:"110 İçermeyen", desc:"L = { w : 110 ⊄ w }", ans:"(0 ∪ 10)*1*", expl:"Tümleyen düşüncesi: 11'den sonra 0 gelmemeli.", src:"1.18f", dif:3 },
  { id:"r18g", tit:"|w| ≤ 5", desc:"L = { w : |w| ≤ 5 }", ans:"(ε∪Σ)(ε∪Σ)(ε∪Σ)(ε∪Σ)(ε∪Σ)", expl:"Her (ε∪Σ) = 0 veya 1 karakter. 5 tane → en fazla 5.", src:"1.18g" },
  { id:"r18h", tit:"11 ve 111 Hariç", desc:"L = Σ* \\ {11, 111}", ans:"ε ∪ 0Σ* ∪ 1 ∪ 10Σ* ∪ 11(0∪1)(0∪1)Σ*", expl:"Case analiz: uzunluk 0,1 veya 2+ farklı başlangıç.", src:"1.18h", dif:3 },
  { id:"r18i", tit:"Tek Pozisyonlar 1", desc:"L = { w : w₁=w₃=w₅=...=1 }", ans:"(1(0∪1))*(1∪ε)", expl:"1Σ çifti tekrar + opsiyonel son 1.", src:"1.18i", dif:2 },
  { id:"r18j", tit:"≥2 Sıfır, ≤1 Bir", desc:"L = { w : #0≥2, #1≤1 }", ans:"0*0(ε∪1)0*0", expl:"En az 2 sıfır + opsiyonel tek 1 ortada. Alternatif: 0*00*∪0*10*0∪0*010*.", src:"1.18j", dif:2 },
  { id:"r18k", tit:"{ε, 0}", desc:"Sonlu küme", ans:"ε ∪ 0", src:"1.18k" },
  { id:"r18l", tit:"Çift 0 veya Tam 2×1", desc:"L = { w : #0 çift ∨ #1=2 }", ans:"(1*01*01*)* ∪ 0*10*10*", expl:"Birleşim: çift-sıfır dalı + tam-iki-bir dalı.", src:"1.18l", dif:3 },
  { id:"r18m", tit:"∅ (Boş Küme)", desc:"L = ∅ — hiçbir string yok", ans:"∅", expl:"∅ ≠ {ε}. Boş küme hiçbirşeyle eşleşmez.", src:"1.18m" },
  { id:"r18n", tit:"Σ⁺ (ε hariç)", desc:"L = { w : |w| ≥ 1 }", ans:"(0∪1)(0∪1)*", expl:"ΣΣ* = en az 1 karakter zorunlu.", src:"1.18n" },
  { id:"rempty", tit:"∅* = {ε}", desc:"R = ∅*\n∅* = {ε} (k=0: boş birleştirme)", ans:"{ε}", expl:"∅ hiçbir şey kabul etmez ama ∅* = {ε}. Tek durumlu NFA.", src:"1.19c" },
].map(d=>({...d, tp:"re", dif:d.dif||1, module:"m3"}));

// ─── RE Membership (8 problems, Sipser 1.20 a-h) ───────────
const RE_MEM = [
  { id:"rm1", tit:"Üyelik: a*b*", re:"a*b*", mem:["ε","ab","aa","aabb"], non:["ba","bab","aba"], src:"1.20a" },
  { id:"rm2", tit:"Üyelik: a(ba)*b", re:"a(ba)*b", mem:["ab","abab","ababab"], non:["ε","b","ba","a"], src:"1.20b" },
  { id:"rm3", tit:"Üyelik: a*∪b*", re:"a*∪b*", mem:["ε","aa","bb"], non:["ab","ba","aab"], src:"1.20c" },
  { id:"rm4", tit:"Üyelik: (aaa)*", re:"(aaa)*", mem:["ε","aaa","aaaaaa"], non:["a","aa","b"], src:"1.20d" },
  { id:"rm5", tit:"Üyelik: Σ*aΣ*bΣ*aΣ*", re:"Σ*aΣ*bΣ*aΣ*", mem:["aba","aaba","abba"], non:["ε","b","bb","a"], src:"1.20e" },
  { id:"rm6", tit:"Üyelik: aba∪bab", re:"aba∪bab", mem:["aba","bab"], non:["ε","a","ab","abab"], src:"1.20f" },
  { id:"rm7", tit:"Üyelik: (ε∪a)b", re:"(ε∪a)b", mem:["b","ab"], non:["ε","a","ba","bb","aab"], src:"1.20g" },
  { id:"rm8", tit:"Üyelik: (a∪ba∪bb)Σ*", re:"(a∪ba∪bb)Σ*", mem:["a","ba","bb","aaa"], non:["ε","b"], src:"1.20h" },
].map(d=>({...d, tp:"re_mem", dif:1, module:"m3", tit:d.tit, desc:`R = ${d.re}\nÜye olan ve olmayan string bulun.`}));

// ─── RE→NFA Thompson (4 problems, 1.19 + 1.28) ────────────
const RE_NFA = [
  { id:"rn1", tit:"RE→NFA: (0∪1)*000(0∪1)*", re:"(0∪1)*000(0∪1)*", steps:["0 ve 1 için basit NFA","(0∪1) birleşim NFA'sı","(0∪1)* Kleene yıldızı","000 doğrusal NFA (3 durum zinciri)","(0∪1)* · 000 · (0∪1)* birleştirme"], src:"1.19a" },
  { id:"rn2", tit:"RE→NFA: (((00)*(11))∪01)*", re:"(((00)*(11))∪01)*", steps:["00 NFA → (00)* Kleene","11 NFA","(00)*(11) birleştirme","01 NFA → ayrı dal","((00)*(11)) ∪ 01 birleşim → dış * Kleene"], src:"1.19b", dif:3 },
  { id:"rn3", tit:"RE→NFA: a(abb)*∪b", re:"a(abb)*∪b", steps:["a, b, abb temel NFA'ları","(abb)* Kleene","a · (abb)* birleştirme","a(abb)* ∪ b birleşim → yeni start, 2 ε-dal"], src:"1.28a" },
  { id:"rn4", tit:"RE→NFA: a⁺∪(ab)⁺", re:"a⁺∪(ab)⁺", steps:["a NFA, ab NFA","a⁺ = a·a* (Kleene sonra concat)","(ab)⁺ = ab·(ab)*","a⁺ ∪ (ab)⁺ birleşim"], src:"1.28b" },
].map(d=>({...d, tp:"re_nfa", dif:d.dif||2, module:"m3", desc:`R = ${d.re}\nLemma 1.55 (Thompson) ile NFA inşa edin.`}));

// ─── GNFA (DFA→RE, 2 problems) ─────────────────────────────
const GNFA = [
  { id:"gn1", tit:"DFA→RE: 2 Durumlu → a*", desc:"Q={1,2}, start=1, F={1}\n1→a→1, 1→b→2, 2→(a,b)→2\nDurum 2 ölü durum.", ans:"a*",
    steps:["GNFA'ya dönüştür: q_start, q_accept ekle","Durum 2 kaldır (ölü durum)","q_start → 1: ε, 1 → q_accept: ε, 1 → 1: a","Sonuç: a*"], src:"1.21a", dif:2 },
  { id:"gn2", tit:"DFA→RE: 3 Durumlu → (a∪b)a*", desc:"Q={1,2,3}, start=1, F={2}\n1→(a,b)→2, 2→a→2, 2→b→3, 3→(a,b)→3", ans:"(a∪b)a*",
    steps:["GNFA'ya dönüştür","Durum 3 kaldır: 2→3→3 döngüsü → 2→b(a∪b)*→... ölü","Durum 1 kaldır: qs→1→2→qa path → (a∪b)","2→2 self-loop: a → a*","Sonuç: (a∪b)a*"], src:"1.21b", dif:3 },
].map(d=>({...d, tp:"gnfa", dif:d.dif||2, module:"m3"}));

// ─── Pumping Lemma (16 problems) ────────────────────────────
const PL = [
  { id:"p1", tit:"{0ⁿ1ⁿ2ⁿ} Düzenli Değil", desc:"A₁ = { 0ⁿ1ⁿ2ⁿ | n ≥ 0 }", s:"s = 0ᵖ1ᵖ2ᵖ, |s| = 3p ≥ p",
    part:"|xy| ≤ p → y tamamen 0'lardan oluşur: y = 0ᵏ (k > 0)",
    pump:"i=2: xy²z = 0^(p+k)·1ᵖ·2ᵖ → 0 sayısı > 1 sayısı",
    contr:"Eşit sayı koşulu bozuldu → xy²z ∉ A₁. Çelişki!", src:"1.29a" },
  { id:"p2", tit:"{www} Düzenli Değil", desc:"A₂ = { www | w ∈ {a,b}* }", s:"s = aᵖbaᵖbaᵖb (w = aᵖb)",
    part:"|xy| ≤ p → y = aᵈ (d > 0), tamamen a'lardan",
    pump:"i=2: xy²z = a^(p+d)baᵖbaᵖb → ilk blok p+d, diğerleri p",
    contr:"İlk w parçası uzadı → www formunda değil", src:"1.29b" },
  { id:"p3", tit:"{a^(2ⁿ)} Düzenli Değil", desc:"A₃ = { a^(2ⁿ) | n ≥ 0 }", s:"s = a^(2ᵖ)", dif:3,
    part:"|y| > 0, |xy| ≤ p → |y| ≤ p < 2ᵖ",
    pump:"i=2: |xy²z| = 2ᵖ + |y|. 2ᵖ < 2ᵖ + |y| ≤ 2ᵖ + p < 2^(p+1)",
    contr:"Arada 2'nin kuvveti yok → xy²z ∉ A₃", src:"1.29c" },
  { id:"p4", tit:"HATA: 0*1* Düzenli Değil?", desc:"Sipser 1.30: Bu ispattaki hatayı bulun!", s:"\"İspat\" s = 0ᵖ1ᵖ seçer", dif:2,
    part:"Hata: Bölümleme y = 0ᵏ → xy²z = 0^(p+k)1ᵖ → dil dışında mı?",
    pump:"AMA: 0^(p+k)1ᵖ ∈ 0*1* ✓ ← HATA BURADA!",
    contr:"Çelişki YOK! 0*1* düzenlidir. PL başarısızlığı ≠ düzensizlik.\nHata: {0ⁿ1ⁿ} ile 0*1* karıştırılmış.", src:"1.30" },
  { id:"p5", tit:"{0ⁿ1ᵐ0ⁿ} Düzenli Değil", desc:"L = { 0ⁿ1ᵐ0ⁿ | m,n ≥ 0 }", s:"s = 0ᵖ1ᵖ0ᵖ",
    part:"|xy| ≤ p → y = 0ᵏ (ilk blokta)",
    pump:"i=2: xy²z = 0^(p+k)1ᵖ0ᵖ → baştaki 0 ≠ sondaki 0",
    contr:"Baş-son 0 eşitliği bozuldu", src:"1.46a" },
  { id:"p6", tit:"{0ᵐ1ⁿ | m≠n} — Kapalılık", desc:"L = { 0ᵐ1ⁿ | m ≠ n }\nKapalılık ile ispat", s:"L düzenli varsay", dif:3,
    part:"L̄ düzenli (tümleyen kapalılık)",
    pump:"L̄ ∩ 0*1* = {0ᵏ1ᵏ} düzenli olurdu",
    contr:"{0ᵏ1ᵏ} düzenli DEĞİL → çelişki!", src:"1.46b" },
  { id:"p7", tit:"{palindrom değil} — Kapalılık", desc:"L = { w : w ≠ wᴿ }", s:"Tümleyen kullan", dif:3,
    part:"L̄ = {palindromlar} düzenli değil",
    pump:"L düzenli → L̄ düzenli (tümleyen)",
    contr:"Palindromlar düzenli değil → çelişki", src:"1.46c" },
  { id:"p8", tit:"{wtw} — Kapalılık", desc:"L = { wtw | w,t ∈ {0,1}⁺ }", s:"Kesişim kullan", dif:3,
    part:"L ∩ 0⁺1⁺0⁺ = {0ⁿ1ᵐ0ⁿ}",
    pump:"{0ⁿ1ᵐ0ⁿ} düzenli değil (1.46a)",
    contr:"L düzenli olsaydı kesişim de olurdu → çelişki", src:"1.46d" },
  { id:"p9", tit:"B = {1ᵏy : #₁(y)≥k} DÜZENLİ!", desc:"Sipser 1.49a: B düzenli mi?", s:"B'yi sadeleştir", dif:2,
    part:"k=1 ⇒ y'de en az 1 bir ⇒ w'de en az 2 bir",
    pump:"B = {w : #₁(w) ≥ 2}",
    contr:"B DÜZENLİDİR! RE: (0∪1)*1(0∪1)*1(0∪1)*\nDikkat: görünüşe aldanma!", src:"1.49a" },
  { id:"p10", tit:"C = {1ᵏy : #₁(y)≤k} D.Değil", desc:"Sipser 1.49b", s:"s = 1ᵖ·0·1ᵖ", dif:2,
    part:"y = 1ᵈ (d>0, önek kısmında)",
    pump:"i=0: xz = 1^(p-d)·0·1ᵖ → yeni k=p-d, #₁(y)=p > k",
    contr:"Çelişki!", src:"1.49b" },
  // Min PL
  { id:"p11", tit:"Min PL: 0001* → p=4", desc:"Minimum pumping length nedir?", s:"p=3 YETMEZ: \"000\" pomplanamaz", dif:2,
    part:"y=0ᵏ → xy²z = 00...0 (>3 sıfır) ∉ L",
    pump:"p=4 YETERLİ: |s|≥4 → en az bir 1 var → onu pompala",
    contr:"Min pumping length = 4", src:"1.55a" },
  { id:"p12", tit:"Min PL: 0*1* → p=1", desc:"Minimum pumping length nedir?", s:"p=0: ε bölünemez",
    part:"p=1 YETERLİ: y = ilk karakter",
    pump:"Pompalama 0*1* içinde kalır",
    contr:"Min PL = 1", src:"1.55b" },
  { id:"p13", tit:"Min PL: 01 → p=3", desc:"L = {01}", s:"p=2: '01' bölünür, y='0' → '001' ∉ L",
    part:"p=3 YETERLİ: |s|≥3 olan string yok",
    pump:"Vacuously true!",
    contr:"Min PL = 3", src:"1.55c" },
  { id:"p14", tit:"Min PL: Σ* → p=1", desc:"L = Σ* (tüm stringler)", s:"p=0: ε bölünemez",
    part:"p=1: y = ilk karakter",
    pump:"Pompalama Σ* içinde kalır (her string üye!)",
    contr:"Min PL = 1", src:"1.55d" },
  { id:"p15", tit:"Min PL: (01)* → p=1", desc:"L = (01)* = {ε, 01, 0101,...}", s:"p=1: '01' → y='0' → '001' ∉ L",
    part:"p=3 deneyelim: '0101' → y='01' → '010101' ∈ L ✓",
    pump:"Tüm bölümlemeler çalışır",
    contr:"Min PL = 1 (ε + trivial case)", src:"1.55e" },
  { id:"p16", tit:"Min PL: {ε} → p=1", desc:"L = {ε}", s:"|s|≥1 olan string YOK",
    part:"Vacuously true: koşul boş",
    pump:"Hiç test edilecek string yok",
    contr:"Min PL = 1", src:"1.55f" },
].map(d=>({...d, tp:"pl", dif:d.dif||2, module:"m3"}));

// ─── CFG (8 problems, Sipser Ch.2) ──────────────────────────
const CFG = [
  { id:"c1", tit:"CFG: {0ⁿ1ⁿ}", desc:"Sipser §2.1: İlk CFG örneği", gram:"S → 0S1 | ε",
    deriv:"S ⇒ 0S1 ⇒ 00S11 ⇒ 000S111 ⇒ 000111", expl:"Her adımda dışarıya 0+1. n kez → 0ⁿ1ⁿ.", src:"§2.1" },
  { id:"c2", tit:"CFG: Palindromlar {wwᴿ}", desc:"Çift uzunluk palindromlar", gram:"S → aSa | bSb | ε",
    deriv:"S ⇒ aSa ⇒ abSba ⇒ abba", expl:"Ortadan simetrik büyüme.", src:"§2.1" },
  { id:"c3", tit:"#₀ = #₁ CFG", desc:"Eşit sayıda 0 ve 1", gram:"S → 0S1S | 1S0S | ε",
    expl:"Her 0 bir 1 ile eşleşir, sıralama serbest.", src:"2.4a" },
  { id:"c4", tit:"#₀ ≠ #₁ CFG", desc:"Eşit OLMAYAN sayıda 0 ve 1", gram:"S → T | U\nT → 0T1T | 1T0T | 0T | 0\nU → 0U1U | 1U0U | 1U | 1",
    expl:"T: fazla 0. U: fazla 1. Birleşim.", src:"2.4b", dif:2 },
  { id:"c5", tit:"Palindrom Olmayan", desc:"w ≠ wᴿ", gram:"S → 0A1 | 1A0 | 0S0 | 1S1\nA → 0A | 1A | ε",
    expl:"Simetrik konumda farklı sembol bul.", src:"2.4d", dif:2 },
  { id:"c6", tit:"aⁱbʲcᵏ (i=j ∨ j=k)", desc:"Birleşim CFG yapısı", gram:"S → S₁ | S₂\nS₁ → XC  X → aXb | ε  C → cC | ε\nS₂ → AY  A → aA | ε  Y → bYc | ε",
    expl:"S₁: a-b eşle, c serbest. S₂: a serbest, b-c eşle.", src:"2.6", dif:3 },
  { id:"c7", tit:"Ambiguity: İngilizce Cümle", desc:"\"the girl touches the boy with the flower\"",
    expl:"Yorum 1: Çiçekle dokunuyor (VP attach)\nYorum 2: Çiçekli çocuğa dokunuyor (NP attach)\nAynı CFG, 2 farklı parse tree → ambiguous!", src:"2.8" },
  { id:"c8", tit:"CNF Dönüşümü", desc:"S→ASA|aB, A→B|S, B→b|ε\nChomsky Normal Form'a çevirin",
    steps:["Adım 1: Yeni başlangıç S₀→S","Adım 2: ε-kuralları kaldır (B nullable → A nullable → S nullable)","Adım 3: Birim kuralları aç (A→B→b, A→S→...)","Adım 4: Uzun kuralları kırp: S→ASA → S→AA₁, A₁→SA","Adım 5: Terminal ayır: S→aB → S→UB, U→a"],
    expl:"4 adımlı CNF algoritması: START → DEL → UNIT → TERM+BIN", src:"2.14", dif:3 },
].map(d=>({...d, tp:"cfg", dif:d.dif||2, module:"m4"}));

// ─── PDA (4 problems) ───────────────────────────────────────
const PDA = [
  { id:"pd1", tit:"PDA: {0ⁿ1ⁿ}", desc:"Klasik PDA: yığıt ile sayma",
    transitions:["q₁ → q₂: ε, ε → $  (yığıt işareti)","q₂ → q₂: 0, ε → 0  (push)","q₂ → q₃: 1, 0 → ε  (pop)","q₃ → q₃: 1, 0 → ε  (pop devam)","q₃ → q₄: ε, $ → ε  (yığıt boş → kabul)"],
    expl:"$ ile yığıt altını işaretle. 0→push, 1→pop. $ gör→kabul.", src:"§2.14" },
  { id:"pd2", tit:"PDA: {wwᴿ} Palindrom", desc:"Nondeterminizm ZORUNLU!", dif:2,
    transitions:["q₁ → q₂: ε, ε → $","q₂ → q₂: 0, ε → 0 | 1, ε → 1  (push)","q₂ → q₃: ε, ε → ε  (ORTAYI TAHMİN ET!)","q₃ → q₃: 0, 0 → ε | 1, 1 → ε  (pop+eşleştir)","q₃ → q₄: ε, $ → ε  (kabul)"],
    expl:"Makine ortanın nerede olduğunu TAHMIN eder.\nİlk yarı→push, ikinci yarı→pop.\nNondeterminizm = paralel deneme.", src:"§2.18" },
  { id:"pd3", tit:"PDA: {aⁱbʲcᵏ | i=j ∨ j=k}", desc:"CFG ile eşdeğer PDA", dif:3,
    transitions:["Nondeterministik dallanma: i=j dalı VEYA j=k dalı","Dal 1: a→push, b→pop, c→yoksay","Dal 2: a→yoksay, b→push, c→pop"],
    expl:"PDA nondeterministik olarak hangi eşitliği kontrol edeceğini seçer.", src:"2.6 PDA" },
  { id:"pd4", tit:"CFL ∩ Regular = CFL", desc:"PDA × DFA çapraz çarpımı → yeni PDA", dif:3,
    transitions:["M_PDA = (Q_P, Σ, Γ, δ_P, q_P, F_P)","M_DFA = (Q_D, Σ, δ_D, q_D, F_D)","Yeni PDA: Q = Q_P × Q_D","δ((q_p,q_d), a, X) = (δ_P(q_p,a,X), δ_D(q_d,a))","F = F_P × F_D"],
    expl:"DFA ve PDA'yı paralel çalıştır.\nPDA yığıtını koru + DFA durumunu takip et.", src:"2.18" },
].map(d=>({...d, tp:"pda", dif:d.dif||2, module:"m4"}));

// ─── CFL Pumping Lemma (3 problems) ────────────────────────
const CFL_PL = [
  { id:"cp1", tit:"{aⁿbⁿcⁿ} CFL Değil", desc:"B = { aⁿbⁿcⁿ : n ≥ 0 }", s:"s = aᵖbᵖcᵖ, |s| = 3p ≥ p",
    part:"|vxy| ≤ p → vxy en fazla 2 sembol türü kapsar",
    pump:"uv²xy²z: pompalanan semboller artar, 3. sabit kalır",
    contr:"Her durumda 3 sembol dengesi bozulur → CFL değil", src:"2.36" },
  { id:"cp2", tit:"{ww} CFL Değil", desc:"D = { ww : w ∈ {0,1}* }", s:"s = 0ᵖ1ᵖ0ᵖ1ᵖ", dif:3,
    part:"|vxy| ≤ p → vxy bir bölgede yoğunlaşır",
    pump:"Pompalama tekrar yapısını (ww) bozar",
    contr:"uv²xy²z ∉ {ww} → D CFL değil", src:"2.37" },
  { id:"cp3", tit:"{0ⁱ1ʲ | i≤j≤2i} — TUZAK!", desc:"L CFL'dir mi?", s:"s = 0ᵖ1ᵖ", dif:3,
    part:"Dikkat: Bu bir TUZAK sorudur!",
    pump:"Bu dil CFL'DİR. PDA ile tanınabilir.",
    contr:"PL başarısızlığı ≠ CFL değil. Doğru string seçimi kritik!", src:"2.30" },
].map(d=>({...d, tp:"cfl_pl", dif:d.dif||2, module:"m4"}));

// ─── TM / Church-Turing (12 problems, Sipser Ch.3) ─────────
const TM = [
  { id:"t1", tit:"TM M₂: Giriş 0 (2⁰)", desc:"Konfigürasyon izleme", expl:"Tek 0 → hemen kabul. q₁0 → ␣q₂ → q_accept", src:"3.1a" },
  { id:"t2", tit:"TM M₂: Giriş 00 (2¹)", desc:"Konfigürasyon izleme", expl:"q₁00 → ␣q₂0 → ␣xq₃␣ → ...tekrar → kabul\nİlk 0'ı sil, ikincisini işaretle, başa dön, kontrol et.", src:"3.1b" },
  { id:"t3", tit:"TM M₂: Giriş 000 (red)", desc:"3 = 2'nin kuvveti değil", expl:"6 → 3 → tek (>1) → q_reject.\n3 2'nin kuvveti değil → red.", src:"3.1c" },
  { id:"t4", tit:"TM M₁: w#w Checker", desc:"Sol/sağ karakter eşleştirme", expl:"1#1 → kabul | 10#11 → red | 10#10 → kabul\nAlgoritma: Sol karakter oku → # atla → sağda eşleştir → tekrarla.", src:"3.2" },
  { id:"t5", tit:"Enumerator Tanımı", desc:"E = (Q, Σ, Γ, δ, q₀, q_print)", expl:"İki bantlı TM: çalışma + yazdırma.\nL(E) = yazdırılan stringlerin kümesi.\nTeorem: E enumerator ⟺ L Turing-tanınabilir.", src:"3.4" },
  { id:"t6", tit:"TM ␣ Yazabilir mi?", desc:"Sipser 3.5: TM hakkında sorular", expl:"a) Evet, ␣ ∈ Γ. b) Hayır, Σ ∌ ␣.\nc) Evet, L-R-L ile aynı hücreye geri dönebilir.\nd) Evet, B ⊆ Γ.", src:"3.5" },
  { id:"t7", tit:"2-PDA > 1-PDA", desc:"{aⁿbⁿcⁿ} 2 yığınla tanınabilir", dif:2, expl:"Yığın 1: a push / b pop.\nYığın 2: b push / c pop.\nÖnemli: 2-PDA = TM gücünde!", src:"3.9a" },
  { id:"t8", tit:"2-PDA = TM", desc:"2 yığın = 1 bant simülasyonu", dif:2, expl:"Yığın 1: kafanın SOLundaki bant.\nYığın 2: kafanın SAĞındaki bant.\nSola git = Yığın 1'den pop, Yığın 2'ye push.\n∴ k-PDA (k≥2) = TM.", src:"3.9b" },
  { id:"t9", tit:"Write-Once TM = Standart TM", desc:"Her hücreye en fazla 1 kez yazma", dif:3, expl:"Simülasyon: Tüm bandı sağa kopyala + değişiklik yap.\nHer adımda O(n) hücre kullanılır. Yavaş ama eşit güçlü.", src:"3.10" },
  { id:"t10", tit:"Mars Paradoksu", desc:"A = {0} veya A = {1}. A karar verilebilir mi?", dif:2, expl:"EVET! Her sonlu dil karar verilebilir.\nM₀: sadece 0 kabul et. M₁: sadece 1 kabul et.\nBiri doğru → A decider VAR. Hangisi olduğunu bilmemiz gerekmiyor!", src:"3.22" },
  { id:"t11", tit:"Decidable Kapalılık", desc:"∪, ∘, *, ∁, ∩ altında kapalı", expl:"Her işlem için: M₁,M₂ decider → M' inşa et.\n∪: M₁ çalıştır, kabul→kabul. Red→M₂ çalıştır.\n∁: M çalıştır, sonucu tersle.\n∩: ∁(∁A ∪ ∁B) de Morgan.", src:"3.15" },
  { id:"t12", tit:"Recognizable Kapalılık", desc:"∪,∘,*,∩ kapalı. ∁: HAYIR!", expl:"∪: Dönüşümlü çalıştır (dovetailing).\n∁: Kapalı DEĞİL! A ve Ā ikisi de recognizable → A decidable.\nRecognizable ∩ co-Recognizable = Decidable.", src:"3.16" },
].map(d=>({...d, tp:"tm", dif:d.dif||2, module:"m5"}));

// ═══ EXPORT ALL ═════════════════════════════════════════════
export const CHALLENGES = [
  ...DFA, ...NFA, ...RE, ...RE_MEM, ...RE_NFA, ...GNFA,
  ...PL, ...CFG, ...PDA, ...CFL_PL, ...TM
];
