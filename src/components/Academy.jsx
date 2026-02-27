// ═══════════════════════════════════════════════════════════════
// Academy.jsx — Otomata Akademi: Teori & Öğrenme Yolu
//
// Sipser-based curriculum: 6 modules
// M0: Foundations → M1: DFA → M2: NFA → M3: RE & PL
// M4: CFG & PDA → M5: TM & Church-Turing
// ═══════════════════════════════════════════════════════════════
import { useState, useCallback, useMemo } from "react";
import { C, F, Card, Btn, Pill, DIF, useI18n } from "../theme";
import TraceExercise, { TRACE_EXERCISES } from "./TraceExercise";
import BuildChallenge, { BUILD_CHALLENGES } from "./BuildChallenge";
import PLGame, { PL_GAMES } from "./PLGame";
import { CHALLENGES as CHALLENGES_DATA } from "../challenges";

// ── Module Content ───────────────────────────────────────────
// Each section: {hd:[TR,EN], body:[TR,EN]}
// Quiz: {q:[TR,EN], opts:[[TR,EN],...], ans:0-index, expl:[TR,EN]}

const MODULES = [
// ─────────────────────────────────────────────────────────────
// M0: TEMELLER
// ─────────────────────────────────────────────────────────────
{id:"m0",c:"#94a3b8",nm:["🧱 Temeller","🧱 Foundations"],
 sub:["Alfabe, String, Dil, Kümeler","Alphabet, String, Language, Sets"],
 pre:null,
 sections:[
  {hd:["Alfabe (Σ)","Alphabet (Σ)"],body:[
`Alfabe, boş olmayan sonlu bir sembol kümesidir.

  Σ = {a, b}       — İkili alfabe
  Σ = {0, 1}       — Binary alfabe
  Σ = {a, b, …, z} — İngilizce küçük harfler

Neden sonlu? Hesaplama modellerimiz sonlu sembollerle çalışır. Sonsuz alfabe tanımsızdır.`,
`An alphabet is a non-empty finite set of symbols.

  Σ = {a, b}       — Binary alphabet
  Σ = {0, 1}       — Binary digits
  Σ = {a, b, …, z} — English lowercase

Why finite? Our computation models work with finite symbols. Infinite alphabets are undefined.`]},
  {hd:["String (w)","String (w)"],body:[
`String, bir alfabe üzerindeki sembollerden oluşan sonlu bir dizidir.

  w = abba   (|w| = 4, Σ = {a,b})
  ε = boş string (|ε| = 0)

Önemli kavramlar:
  • |w| = stringin uzunluğu
  • wR = stringin tersi (abba → abba, palindrom!)
  • Σ* = Σ üzerindeki TÜM stringlerin kümesi (ε dahil)
  • Σ⁺ = Σ* − {ε} (boş string hariç)

Örnek: Σ = {0,1} ise Σ* = {ε, 0, 1, 00, 01, 10, 11, 000, …}`,
`A string is a finite sequence of symbols from an alphabet.

  w = abba   (|w| = 4, Σ = {a,b})
  ε = empty string (|ε| = 0)

Key concepts:
  • |w| = length of string
  • wR = reverse of string (abba → abba, palindrome!)
  • Σ* = set of ALL strings over Σ (including ε)
  • Σ⁺ = Σ* − {ε} (without empty string)

Example: If Σ = {0,1} then Σ* = {ε, 0, 1, 00, 01, 10, 11, 000, …}`]},
  {hd:["Dil (L)","Language (L)"],body:[
`Dil, Σ* üzerindeki herhangi bir alt kümedir.

  L₁ = {a, aa, aaa, …}   — Sadece a'lardan oluşan stringler
  L₂ = {w ∈ {0,1}* | w'de eşit sayıda 0 ve 1 var}
  L₃ = ∅                  — Boş dil (hiçbir string yok)
  L₄ = {ε}                — Sadece boş string

DİKKAT: ∅ ≠ {ε}!  Boş dil vs. sadece ε içeren dil.

Diller sonlu veya sonsuz olabilir. Otomata teorisinin amacı: "Hangi makineler hangi dilleri tanıyabilir?"`,
`A language is any subset of Σ*.

  L₁ = {a, aa, aaa, …}   — Strings of only a's
  L₂ = {w ∈ {0,1}* | w has equal 0s and 1s}
  L₃ = ∅                  — Empty language (no strings)
  L₄ = {ε}                — Contains only empty string

CAUTION: ∅ ≠ {ε}!  Empty language vs. language with only ε.

Languages can be finite or infinite. Goal of automata theory: "Which machines can recognize which languages?"`]},
  {hd:["Küme İşlemleri","Set Operations"],body:[
`Diller küme olduğu için küme işlemleri uygulanır:

  • Birleşim (Union):     A ∪ B = {w | w ∈ A veya w ∈ B}
  • Kesişim (Intersection): A ∩ B = {w | w ∈ A ve w ∈ B}
  • Tümleme (Complement): Ā = {w ∈ Σ* | w ∉ A}
  • Concatenation:        A ∘ B = {xy | x ∈ A, y ∈ B}
  • Kleene Star:          A* = {ε} ∪ A ∪ A² ∪ A³ ∪ …

Önemli: Düzenli diller bu işlemler altında KAPALIDIR (Teorem 1.25, 1.26).`,
`Since languages are sets, set operations apply:

  • Union:          A ∪ B = {w | w ∈ A or w ∈ B}
  • Intersection:   A ∩ B = {w | w ∈ A and w ∈ B}
  • Complement:     Ā = {w ∈ Σ* | w ∉ A}
  • Concatenation:  A ∘ B = {xy | x ∈ A, y ∈ B}
  • Kleene Star:    A* = {ε} ∪ A ∪ A² ∪ A³ ∪ …

Key: Regular languages are CLOSED under these operations (Theorem 1.25, 1.26).`]}
 ],
 quiz:[
  {q:["Σ = {a,b} ise Σ* hangi küme?","If Σ = {a,b}, what is Σ*?"],
   opts:[["Sadece a ve b","Only a and b"],["Tüm sonlu stringler (ε dahil)","All finite strings (inc. ε)"],["Sonsuz uzunlukta stringler","Infinite length strings"]],ans:1,
   expl:["Σ* alfabe üzerindeki boş string dahil TÜM sonlu stringleri içerir.","Σ* contains ALL finite strings over the alphabet, including ε."]},
  {q:["∅ ile {ε} arasındaki fark nedir?",`What's the difference between ∅ and {ε}?`],
   opts:[["Aynı şey","Same thing"],["∅ boş, {ε} bir elemanlı","∅ is empty, {ε} has one element"],["∅ sonsuz, {ε} sonlu","∅ is infinite, {ε} is finite"]],ans:1,
   expl:["∅ hiçbir string içermez. {ε} tam olarak 1 string (boş string) içerir.","∅ contains no strings. {ε} contains exactly 1 string (the empty string)."]},
  {q:["A={a,ab} B={b,ba} ise A∘B hangi küme?","If A={a,ab} B={b,ba}, what is A∘B?"],
   opts:[["{ab, aba, abb, abba}","{ab, aba, abb, abba}"],["{a,ab,b,ba}","{a,ab,b,ba}"],["{aab, abab}","{aab, abab}"]],ans:0,
   expl:["A∘B = {xy | x∈A, y∈B}. a∘b=ab, a∘ba=aba, ab∘b=abb, ab∘ba=abba.","A∘B = {xy | x∈A, y∈B}. a∘b=ab, a∘ba=aba, ab∘b=abb, ab∘ba=abba."]},
  {q:["|w|=3 ve Σ={0,1} ise kaç farklı w var?","If |w|=3 and Σ={0,1}, how many strings w?"],
   opts:[["3","3"],["6","6"],["8","8"]],ans:2,
   expl:["|Σ|^|w| = 2³ = 8. Her pozisyon 2 seçenek: 000,001,010,011,100,101,110,111.","|Σ|^|w| = 2³ = 8. Each position has 2 choices: 000,001,010,011,100,101,110,111."]},
  // ── Faz 3+: M0 extended quizzes ──
  {type:"multi",
   q:["Aşağıdakilerden hangileri Σ={0,1} üzerinde geçerli bir DİLDİR?","Which of the following are valid LANGUAGES over Σ={0,1}?"],
   strings:[["∅ (boş küme)","∅ (empty set)"],["{ε}","{ε}"],["{0,1,00,11}","{0,1,00,11}"],["Σ* (tüm stringler)","Σ* (all strings)"]],
   accept:[0,1,2,3],
   expl:["Hepsi geçerli! Dil, Σ* üzerindeki HERHANGİ bir alt kümedir — boş, sonlu veya sonsuz olabilir.",
         "All are valid! A language is ANY subset of Σ* — it can be empty, finite, or infinite."]},
  {type:"match",
   q:["Küme işlemlerini eşleştirin:","Match the set operations:"],
   left:[["A ∪ B","A ∪ B"],["A ∩ B","A ∩ B"],["Ā","Ā"],["A*","A*"]],
   right:[["A veya B'de olan","In A or B"],["Hem A hem B'de olan","In both A and B"],["A'da olmayan","Not in A"],["0+ kez tekrar","0+ repetitions"]],
   pairs:[[0,0],[1,1],[2,2],[3,3]],
   expl:["∪=birleşim, ∩=kesişim, ¯=tümleme, *=Kleene star.","∪=union, ∩=intersection, ¯=complement, *=Kleene star."]},
  {q:["A={a} ise A* hangi küme?","If A={a}, what is A*?"],
   opts:[["{a}","{a}"],["{ε, a, aa, aaa, …}","{ε, a, aa, aaa, …}"],["{aa, aaa, …}","{aa, aaa, …}"]],ans:1,
   expl:["A* = 0 veya daha fazla tekrar = {ε, a, aa, aaa, …}. ε her zaman A*'dadır!","A* = 0 or more repetitions = {ε, a, aa, aaa, …}. ε is always in A*!"]},
  {q:["Σ={a,b} için |Σ²| = ?","For Σ={a,b}, |Σ²| = ?"],
   opts:[["2","2"],["4","4"],["6","6"]],ans:1,
   expl:["Σ² = uzunluğu 2 olan stringler: aa, ab, ba, bb → 4 tane. |Σᵏ| = |Σ|ᵏ = 2² = 4.","Σ² = strings of length 2: aa, ab, ba, bb → 4. |Σᵏ| = |Σ|ᵏ = 2² = 4."]}
 ]},

// ─────────────────────────────────────────────────────────────
// M1: DFA
// ─────────────────────────────────────────────────────────────
{id:"m1",c:C.ch1,nm:["⚙️ DFA","⚙️ DFA"],
 sub:["Belirlenimli Sonlu Otomat","Deterministic Finite Automaton"],
 pre:["m0"],
 sections:[
  {hd:["Tanım (Sipser 1.5)","Definition (Sipser 1.5)"],body:[
`Belirlenimli Sonlu Otomat (DFA) 5-tuple olarak tanımlanır:

  M = (Q, Σ, δ, q₀, F)

  Q  = Sonlu durum kümesi
  Σ  = Alfabe (giriş sembolleri)
  δ  = Geçiş fonksiyonu: Q × Σ → Q
  q₀ = Başlangıç durumu (q₀ ∈ Q)
  F  = Kabul durumları (F ⊆ Q)

KRİTİK: δ bir FONKSİYONDUR. Her (durum, sembol) çifti için TAM OLARAK 1 hedef durum vardır. Belirsizlik yoktur.`,
`A Deterministic Finite Automaton (DFA) is a 5-tuple:

  M = (Q, Σ, δ, q₀, F)

  Q  = Finite set of states
  Σ  = Alphabet (input symbols)
  δ  = Transition function: Q × Σ → Q
  q₀ = Start state (q₀ ∈ Q)
  F  = Accept states (F ⊆ Q)

CRITICAL: δ is a FUNCTION. For each (state, symbol) pair there is EXACTLY 1 target state. No ambiguity.`]},
  {hd:["Hesaplama (Computation)","Computation"],body:[
`DFA bir stringi şu şekilde işler:

  1. q₀'dan başla
  2. Giriş stringinin her sembolünü sırayla oku
  3. Her sembol için δ ile bir sonraki duruma geç
  4. String bittiğinde: mevcut durum ∈ F ise KABUL, değilse RET

Örnek: M = ({q0,q1}, {a,b}, δ, q0, {q1})
  δ(q0,a) = q1,  δ(q0,b) = q0
  δ(q1,a) = q0,  δ(q1,b) = q1

  "aba" → q0 →a→ q1 →b→ q1 →a→ q0 → RET (q0 ∉ F)
  "ab"  → q0 →a→ q1 →b→ q1 → KABUL (q1 ∈ F)`,
`A DFA processes a string as follows:

  1. Start at q₀
  2. Read each symbol of the input sequentially
  3. For each symbol, transition via δ
  4. When string ends: if current state ∈ F → ACCEPT, else REJECT

Example: M = ({q0,q1}, {a,b}, δ, q0, {q1})
  δ(q0,a) = q1,  δ(q0,b) = q0
  δ(q1,a) = q0,  δ(q1,b) = q1

  "aba" → q0 →a→ q1 →b→ q1 →a→ q0 → REJECT (q0 ∉ F)
  "ab"  → q0 →a→ q1 →b→ q1 → ACCEPT (q1 ∈ F)`]},
  {hd:["Trap State & Tamlık","Trap State & Completeness"],body:[
`Tam DFA: her (q,σ) çifti için bir geçiş olmalıdır.

Eğer bir durumda bir sembol için geçiş yoksa ne olur?
→ DFA "takılır" ve stringi reddeder.

Bunu açıkça modellemek için TRAP STATE (tuzak durum) eklenir:
  • Tüm eksik geçişler trap'e yönlenir
  • Trap kendine döner (çıkış yoktur)
  • Trap KABUL durumu DEĞİLDİR

Sandbox'ta "Tek 'a'" örneğinde trap state'i görebilirsiniz.`,
`Complete DFA: there must be a transition for every (q,σ) pair.

What if a state has no transition for some symbol?
→ DFA "gets stuck" and rejects the string.

To model this explicitly, add a TRAP STATE:
  • All missing transitions go to trap
  • Trap loops to itself (no escape)
  • Trap is NOT an accept state

You can see the trap state in the "Only 'a'" example in Sandbox.`]},
  {hd:["Düzenli Diller (Teorem 1.16)","Regular Languages (Theorem 1.16)"],body:[
`Tanım: Bir dil DÜZENLI (regular) ise ve ancak onu tanıyan bir DFA varsa.

  L(M) = {w ∈ Σ* | M stringi w'yi kabul eder}

Düzenli diller birleşim, kesişim, tümleme, concatenation ve Kleene star altında kapalıdır.

Kapalılık ispatı (birleşim): İki DFA M₁ ve M₂ verildiğinde, ürün yapısı (product construction) ile M₁ ∪ M₂'yi tanıyan yeni bir DFA yapılabilir.`,
`Definition: A language is REGULAR iff there exists a DFA that recognizes it.

  L(M) = {w ∈ Σ* | M accepts string w}

Regular languages are closed under union, intersection, complement, concatenation, and Kleene star.

Closure proof (union): Given two DFAs M₁ and M₂, using product construction we can build a new DFA recognizing M₁ ∪ M₂.`]},
  {hd:["🔧 DFA Hata Ayıklama (JFLAP Stili)","🔧 DFA Debugging (JFLAP Style)"],body:[
`Pratik beceri: Verilen bir DFA'nın HATALI olduğunu tespit etme.

JFLAP'ın en etkili egzersiz formatı: "Bu DFA L dilini tanıdığını iddia ediyor ama yanlış. 3 kabul edilmesi gerekip reddedilen, 3 reddedilmesi gerekip kabul edilen string bul."

Strateji:
  1. Önce iddia edilen dili anla
  2. Basit stringlerden başla: ε, a, b, aa, ab, ba, bb, …
  3. Her stringi zihinsel olarak DFA'da izle
  4. Uyumsuzluk bul → hatanın kaynağını belirle

Sık yapılan hatalar:
  • Eksik geçiş (trap state unutulmuş)
  • Yanlış kabul durumu (F kümesi yanlış)
  • Ters yönlü geçiş (a ile b karışmış)
  • Başlangıç durumu yanlış

Bu beceriyi Sandbox'ta pratik yapabilirsiniz: bir preset yükleyin, bir geçişi değiştirin ve batch test ile hatayı gözlemleyin.`,
`Practical skill: Detecting that a given DFA is INCORRECT.

JFLAP's most effective exercise format: "This DFA claims to recognize language L but is wrong. Find 3 strings that should be accepted but are rejected, and 3 that should be rejected but are accepted."

Strategy:
  1. First understand the claimed language
  2. Start with simple strings: ε, a, b, aa, ab, ba, bb, …
  3. Mentally trace each string through the DFA
  4. Find mismatch → identify error source

Common mistakes:
  • Missing transition (trap state forgotten)
  • Wrong accept states (F set incorrect)
  • Reversed transitions (a and b swapped)
  • Wrong start state

Practice this in Sandbox: load a preset, change a transition, and observe the error via batch test.`]},
  {hd:["🧩 Eşdeğerlik Sınıfları (Myhill-Nerode)","🧩 Equivalence Classes (Myhill-Nerode)"],body:[
`Myhill-Nerode Teoremi (Sipser Teorem 1.70B): Minimum DFA'nın durum sayısı = eşdeğerlik sınıfı sayısı.

İki string x ve y "L-ayırt edilemez" ise:
  ∀z ∈ Σ*: xz ∈ L ⟺ yz ∈ L

Yani her olası devam stringi z için aynı sonucu verirler.

Örnek: L = {w | w tek sayıda a içerir}, Σ = {a,b}

  ε ve aa → ikisi de "çift a" durumunda → eşdeğer
  a ve aaa → ikisi de "tek a" durumunda → eşdeğer
  ε ve a → ε çift, a tek → z=ε ile ayırt edilir → farklı sınıflar

Sınıf 1: {ε, aa, bb, aabb, ...} → çift a (REJECT)
Sınıf 2: {a, aab, bab, ...}   → tek a (ACCEPT)

2 sınıf → minimum DFA 2 durum gerektirir ✓

KULLANIM:
  1. Minimum DFA boyutunu bulmak
  2. Bir dilin düzenli OLMADIĞINI ispatlamak (sonsuz sınıf → düzenli değil)
  3. DFA minimizasyonunu doğrulamak

Pratik: 7Q→Min JFLAP presetini yükle ve eşdeğer durumları bul!`,
`Myhill-Nerode Theorem (Sipser Theorem 1.70B): Minimum DFA state count = number of equivalence classes.

Two strings x and y are "L-indistinguishable" if:
  ∀z ∈ Σ*: xz ∈ L ⟺ yz ∈ L

They give the same result for every possible continuation z.

Example: L = {w | w has odd number of a's}, Σ = {a,b}

  ε and aa → both in "even a" state → equivalent
  a and aaa → both in "odd a" state → equivalent
  ε and a → ε is even, a is odd → distinguished by z=ε → different classes

Class 1: {ε, aa, bb, aabb, ...} → even a (REJECT)
Class 2: {a, aab, bab, ...}   → odd a (ACCEPT)

2 classes → minimum DFA needs 2 states ✓

USAGE:
  1. Finding minimum DFA size
  2. Proving a language is NOT regular (infinite classes → not regular)
  3. Verifying DFA minimization

Practice: Load the 7Q→Min JFLAP preset and find equivalent states!`]}
 ],
 quiz:[
  {q:["DFA'da δ(q, a) kaç sonuç üretir?","How many results does δ(q, a) produce in a DFA?"],
   opts:[["0 veya 1","0 or 1"],["Tam olarak 1","Exactly 1"],["1 veya daha fazla","1 or more"]],ans:1,
   expl:["δ bir fonksiyondur: her girdiye TAM OLARAK 1 çıktı. Bu DFA'yı NFA'dan ayırır.","δ is a function: exactly 1 output per input. This distinguishes DFA from NFA."]},
  {q:["Trap state ne işe yarar?","What is the purpose of a trap state?"],
   opts:[["Stringi kabul eder","Accepts strings"],["Eksik geçişleri yakalar","Catches missing transitions"],["Durumları siler","Deletes states"]],ans:1,
   expl:["Trap state, DFA'yı tam yapmak için eklenir. Tüm eksik geçişler trap'e yönlenir.","Trap state makes the DFA complete. All missing transitions point to trap."]},
  {q:["DFA M=({q0,q1},{a,b},δ,q0,{q1}), δ(q0,a)=q1, δ(q0,b)=q0, δ(q1,a)=q0, δ(q1,b)=q1. 'aba' kabul edilir mi?","DFA M=({q0,q1},{a,b},δ,q0,{q1}), δ(q0,a)=q1, δ(q0,b)=q0, δ(q1,a)=q0, δ(q1,b)=q1. Is 'aba' accepted?"],
   opts:[["Evet","Yes"],["Hayır","No"],["Tanımsız","Undefined"]],ans:1,
   expl:["q0→a→q1→b→q1→a→q0. Son durum q0∉F={q1}. RET.","q0→a→q1→b→q1→a→q0. Final state q0∉F={q1}. REJECT."]},
  {q:["Çift sayıda a kabul eden DFA en az kaç durum gerektirir?","Minimum states for a DFA accepting even number of a's?"],
   opts:[["1","1"],["2","2"],["3","3"]],ans:1,
   expl:["2 durum: 'even' (kabul, başlangıç) ve 'odd'. a ile aralarında geçiş. Parite DFA.","2 states: 'even' (accept, start) and 'odd'. Toggle between them on a. Parity DFA."]},
  {q:["L={ab ile biter} için Myhill-Nerode eşdeğerlik sınıfı sayısı?","Myhill-Nerode equivalence classes for L={ends with ab}?"],
   opts:[["2","2"],["3","3"],["4","4"]],ans:1,
   expl:["3 sınıf: (1) hiç/genel, (2) son karakter a, (3) son 2 karakter ab. 3 sınıf = min 3 durumluk DFA.","3 classes: (1) general, (2) last char is a, (3) last 2 chars are ab. 3 classes = min 3-state DFA."]},
  // ── Faz 3: Multi-select quiz ──
  {type:"multi",
   q:["DFA: M=({q0,q1},{a,b},δ,q0,{q1}), δ(q0,a)=q1, δ(q0,b)=q0, δ(q1,a)=q0, δ(q1,b)=q1. Hangi stringler KABUL edilir?",
      "DFA: M=({q0,q1},{a,b},δ,q0,{q1}), δ(q0,a)=q1, δ(q0,b)=q0, δ(q1,a)=q0, δ(q1,b)=q1. Which strings are ACCEPTED?"],
   strings:[["a","a"],["ab","ab"],["bb","bb"],["aba","aba"],["b","b"],["abba","abba"]],
   accept:[0,1,4],
   expl:["'a'→q1✓, 'ab'→q1✓, 'bb'→q0✗, 'aba'→q0✗, 'b'→q1 HAYır q0✗… Pardon: δ(q0,b)=q0∉F. Tek a sayısı: a✓,ab✓(1 a),b✗(0 a). Tek a = kabul.",
         "'a'→q1✓, 'ab'→q1✓, 'bb'→q0✗, 'aba'→q0✗, 'b'→q0✗, 'abba'→q0✗. Odd number of a's = accept."]},
  // ── Faz 3: Match quiz ──
  {type:"match",
   q:["DFA bileşenlerini eşleştirin:","Match the DFA components:"],
   left:[["Q","Q"],["δ","δ"],["F","F"],["q₀","q₀"]],
   right:[["Sonlu durum kümesi","Finite set of states"],["Geçiş fonksiyonu","Transition function"],["Kabul durumları","Accept states"],["Başlangıç durumu","Start state"]],
   pairs:[[0,0],[1,1],[2,2],[3,3]],
   expl:["Q=durumlar, δ=geçiş fonksiyonu, F=kabul durumları, q₀=başlangıç durumu.","Q=states, δ=transition function, F=accept states, q₀=start state."]}
 ],sandbox:"dfa"},

// ─────────────────────────────────────────────────────────────
// M2: NFA
// ─────────────────────────────────────────────────────────────
{id:"m2",c:"#34d399",nm:["🔀 NFA","🔀 NFA"],
 sub:["Belirlenimci Olmayan Sonlu Otomat","Nondeterministic Finite Automaton"],
 pre:["m1"],
 sections:[
  {hd:["Tanım (Sipser 1.36)","Definition (Sipser 1.36)"],body:[
`NFA da 5-tuple: M = (Q, Σ, δ, q₀, F)

Fark: δ : Q × (Σ ∪ {ε}) → P(Q)

  • δ bir KÜME döndürür (0, 1 veya birden fazla hedef)
  • ε-geçiş: sembol okumadan durum değiştirebilir

NFA bir stringi kabul eder ⟺ EN AZ BİR hesaplama yolu kabul durumuna ulaşır.

Düşünce modeli: NFA paralel evrenlerde çalışır. Her dallanmada evren çoğalır. Herhangi bir evren kabul ederse → KABUL.`,
`NFA is also a 5-tuple: M = (Q, Σ, δ, q₀, F)

Difference: δ : Q × (Σ ∪ {ε}) → P(Q)

  • δ returns a SET (0, 1, or multiple targets)
  • ε-transition: can change state without reading a symbol

NFA accepts a string ⟺ AT LEAST ONE computation path reaches an accept state.

Mental model: NFA runs in parallel universes. Each branch multiplies universes. If any universe accepts → ACCEPT.`]},
  {hd:["ε-Closure","ε-Closure"],body:[
`ε-closure(q) = q'dan ε-geçişlerle ulaşılabilen TÜM durumlar (q dahil).

Algoritma:
  1. Kümeye q'yu ekle
  2. q'dan ε-geçişle gidilebilen durumları ekle
  3. Yeni eklenen durumlardan ε ile gidilebilenleri ekle
  4. Yeni durum kalmayana kadar tekrarla

Örnek: q₀ →ε→ q₁ →ε→ q₂
  ε-closure({q₀}) = {q₀, q₁, q₂}

Bu NFA simülasyonunun temel taşıdır.`,
`ε-closure(q) = ALL states reachable from q via ε-transitions (including q).

Algorithm:
  1. Add q to the set
  2. Add states reachable via ε from q
  3. Add states reachable via ε from newly added states
  4. Repeat until no new states

Example: q₀ →ε→ q₁ →ε→ q₂
  ε-closure({q₀}) = {q₀, q₁, q₂}

This is the foundation of NFA simulation.`]},
  {hd:["NFA ≡ DFA (Teorem 1.39)","NFA ≡ DFA (Theorem 1.39)"],body:[
`TEORİ'NİN EN ÖNEMLİ TEOREMİ:

  Her NFA için eşdeğer bir DFA vardır.

İspat: Subset Construction (Alt Küme Yapısı)
  1. NFA'nın N durumu varsa, DFA en fazla 2ᴺ duruma sahip olabilir
  2. DFA'nın her durumu = NFA'nın bir durum ALT KÜMESİ
  3. DFA kabul = alt küme herhangi bir NFA kabul durumu içerir

Bu, NFA'nın DFA'dan DAHA GÜÇLÜ OLMADIĞI anlamına gelir!
Kolaylık sağlar ama güç eklemez.

DİKKAT: Durum sayısı üssel artabilir! Sandbox'ta "3rd-last=1" örneği bunu gösterir.`,
`THE MOST IMPORTANT THEOREM IN THE COURSE:

  For every NFA there exists an equivalent DFA.

Proof: Subset Construction
  1. If NFA has N states, DFA can have at most 2ᴺ states
  2. Each DFA state = a SUBSET of NFA states
  3. DFA accepts = subset contains any NFA accept state

This means NFA is NOT MORE POWERFUL than DFA!
It provides convenience but not additional power.

CAUTION: State count can grow exponentially! The "3rd-last=1" example in Sandbox demonstrates this.`]},
  {hd:["🔄 NFA→DFA Dönüşüm Rehberi","🔄 NFA→DFA Conversion Guide"],body:[
`Adım adım dönüşüm (JFLAP yaklaşımı):

ADIM 1: ε-closure(q₀) hesapla → DFA'nın başlangıç durumu
  NFA: q₀ →ε→ q₁ ise DFA başlangıç = {q₀,q₁}

ADIM 2: Her DFA durumu (NFA durum kümesi) için:
  Her sembol a ∈ Σ için:
    • Kümedeki her NFA durumundan a ile gidilebilen durumları bul
    • Bu durumların ε-closure'ını al
    • Sonuç = yeni DFA durumu

ADIM 3: NFA kabul durumu içeren DFA durumları → DFA kabul durumları

Örnek: NFA {q0,q1,q2}, q0→a→{q0,q1}, q0→b→{q0}, q1→b→{q2}
  DFA başlangıç: {q0}
  {q0} →a→ {q0,q1}   →b→ {q0}
  {q0,q1} →a→ {q0,q1}  →b→ {q0,q2} ← kabul (q2∈F)
  {q0,q2} →a→ {q0,q1}  →b→ {q0}

NFA→DFA aracını kullanarak bunu interaktif olarak deneyebilirsiniz.`,
`Step-by-step conversion (JFLAP approach):

STEP 1: Compute ε-closure(q₀) → DFA start state
  NFA: q₀ →ε→ q₁ means DFA start = {q₀,q₁}

STEP 2: For each DFA state (set of NFA states):
  For each symbol a ∈ Σ:
    • Find all NFA states reachable via a from states in the set
    • Take ε-closure of those states
    • Result = new DFA state

STEP 3: DFA states containing NFA accept states → DFA accept states

Example: NFA {q0,q1,q2}, q0→a→{q0,q1}, q0→b→{q0}, q1→b→{q2}
  DFA start: {q0}
  {q0} →a→ {q0,q1}   →b→ {q0}
  {q0,q1} →a→ {q0,q1}  →b→ {q0,q2} ← accept (q2∈F)
  {q0,q2} →a→ {q0,q1}  →b→ {q0}

Try this interactively using the NFA→DFA tool.`]}
 ],
 quiz:[
  {q:["NFA 3 durumlu ise DFA en fazla kaç durum olabilir?","If NFA has 3 states, max DFA states via subset construction?"],
   opts:[["3","3"],["6","6"],["8 (2³)","8 (2³)"]],ans:2,
   expl:["2ᴺ = 2³ = 8. Her alt küme bir DFA durumu olur.","2ᴺ = 2³ = 8. Each subset becomes a DFA state."]},
  {q:["ε-geçiş ne yapar?","What does an ε-transition do?"],
   opts:[["Sembol okur","Reads a symbol"],["Sembol okumadan durum değiştirir","Changes state without reading"],["Stringi siler","Deletes the string"]],ans:1,
   expl:["ε-geçiş giriş tüketmeden durum değişikliği sağlar.","ε-transition allows state change without consuming input."]},
  {q:["NFA'da q0→a→{q1,q2} ne demek?","In NFA, q0→a→{q1,q2} means what?"],
   opts:[["Önce q1 sonra q2'ye git","Go q1 then q2"],["a ile hem q1 hem q2 mümkün (paralel)","a goes to both q1 and q2 (parallel)"],["a okunmadan geç","Skip without reading a"]],ans:1,
   expl:["NFA nondeterministik: bir sembolle birden fazla hedefe gidilebilir. Paralel yollar keşfedilir.","NFA is nondeterministic: one symbol can lead to multiple targets. Parallel paths explored."]},
  {q:["NFA stringi ne zaman KABUL eder?","When does NFA ACCEPT a string?"],
   opts:[["Tüm yollar kabul durumuna ulaşırsa","All paths reach accept"],["En az 1 yol kabul durumuna ulaşırsa","At least 1 path reaches accept"],["Çoğunluk kabul ederse","Majority accepts"]],ans:1,
   expl:["NFA'da TEK BİR kabul yolu yeterli. Diğer yolların reddetmesi önemli değil.","In NFA, a SINGLE accepting path suffices. Other rejecting paths don't matter."]},
  // ── Faz 3: Ordering quiz ──
  {type:"order",
   q:["NFA→DFA subset construction adımlarını sırala:","Order the NFA→DFA subset construction steps:"],
   items:[["ε-closure(q₀) hesapla","Compute ε-closure(q₀)"],["Her sembol için move() uygula","Apply move() for each symbol"],["Yeni durumların ε-closure'ını al","Take ε-closure of new states"],["NFA kabul durumu içeren DFA durumlarını işaretle","Mark DFA states containing NFA accept states"]],
   correctOrder:[0,1,2,3],
   expl:["Sıra: ε-closure → move → ε-closure → kabul işaretleme. Her yeni küme için tekrarla.",
         "Order: ε-closure → move → ε-closure → mark accepts. Repeat for each new set."]}
 ],sandbox:"nfa"},

// ─────────────────────────────────────────────────────────────
// M3: RE & Pumping Lemma
// ─────────────────────────────────────────────────────────────
{id:"m3",c:C.ch2,nm:["📐 RE & PL","📐 RE & PL"],
 sub:["Düzenli İfadeler & Pompalama Lemması","Regular Expressions & Pumping Lemma"],
 pre:["m1","m2"],
 sections:[
  {hd:["Düzenli İfadeler (Sipser 1.52)","Regular Expressions (Sipser 1.52)"],body:[
`RE, DFA/NFA ile aynı dilleri tanımlar (Teorem 1.54).

Yapı taşları:
  a       — tek sembol a
  ε       — boş string
  ∅       — boş dil
  R₁ ∪ R₂ — birleşim (union)
  R₁ ∘ R₂ — ardışık bağlama (concatenation)
  R*      — Kleene star (0 veya daha fazla tekrar)

Öncelik: * > ∘ > ∪

Örnekler:
  (a ∪ b)* = Σ* (tüm stringler)
  a*b* = {aⁿbᵐ | n,m ≥ 0}
  (ab)* = {ε, ab, abab, ababab, …}`,
`RE defines the same languages as DFA/NFA (Theorem 1.54).

Building blocks:
  a       — single symbol a
  ε       — empty string
  ∅       — empty language
  R₁ ∪ R₂ — union
  R₁ ∘ R₂ — concatenation
  R*      — Kleene star (0 or more repetitions)

Precedence: * > ∘ > ∪

Examples:
  (a ∪ b)* = Σ* (all strings)
  a*b* = {aⁿbᵐ | n,m ≥ 0}
  (ab)* = {ε, ab, abab, ababab, …}`]},
  {hd:["Pompalama Lemması (Sipser 1.70)","Pumping Lemma (Sipser 1.70)"],body:[
`Bir dilin DÜZENLI OLMADIĞINI ispatlamak için:

L düzenli ise, bir p sayısı (pompalama uzunluğu) vardır öyle ki:
Her w ∈ L, |w| ≥ p için, w = xyz bölümlemesi vardır:
  1. |y| > 0 (y boş değil)
  2. |xy| ≤ p
  3. ∀i ≥ 0: xyⁱz ∈ L (y'yi istediğin kadar pompala)

İspat yapısı (çelişki ile):
  ① L'nin düzenli olduğunu varsay
  ② p'yi al, akıllıca bir w ∈ L seç (|w| ≥ p)
  ③ HERHANGİ bir xyz bölümlemesi için (koşullar 1,2 altında)
  ④ Bir i değeri bul öyle ki xyⁱz ∉ L → ÇELİŞKİ!

Klasik örnek: {0ⁿ1ⁿ | n ≥ 0} düzenli değildir.`,
`To prove a language is NOT REGULAR:

If L is regular, there exists p (pumping length) such that:
For every w ∈ L, |w| ≥ p, there exists partition w = xyz where:
  1. |y| > 0 (y is non-empty)
  2. |xy| ≤ p
  3. ∀i ≥ 0: xyⁱz ∈ L (pump y any number of times)

Proof structure (by contradiction):
  ① Assume L is regular
  ② Take p, choose a clever w ∈ L (|w| ≥ p)
  ③ For ANY partition xyz (under conditions 1,2)
  ④ Find an i such that xyⁱz ∉ L → CONTRADICTION!

Classic example: {0ⁿ1ⁿ | n ≥ 0} is not regular.`]},
  {hd:["🔍 Regex'te Kelimeler (Automata Tutor)","🔍 Words in Regex (Automata Tutor)"],body:[
`Temel beceri: Verilen bir regex'in hangi stringleri kabul/ret ettiğini belirlemek.

Strateji:
  1. Regex'i parçalara ayır (öncelik: * > ∘ > ∪)
  2. En içteki parçadan dışa doğru analiz et
  3. Sınır durumlarını kontrol et: ε, tek karakter, çok uzun

Egzersiz — Aşağıdaki stringler (0∪1)*0(0∪1) tarafından kabul edilir mi?

  "00"  → (0∪1)*=ε, 0, (0∪1)=0 → 00 ✓ KABUL
  "010" → (0∪1)*=ε, 0, (0∪1)=10 → HAYIR! (0∪1) tek karakter!
        → (0∪1)*=0, 0=nasıl? "01" 0'a eşleşmez...
        → (0∪1)*=01, ama sonra 0 ve (0∪1) lazım → 010 = 01+0+? eksik → RET
  "100" → (0∪1)*=1, 0=0, (0∪1)=0 → 100 ✓ KABUL
  "0"   → (0∪1)* ve 0 ve (0∪1) en az 2 karakter → RET
  "1001"→ (0∪1)*=10, 0=0, (0∪1)=1 → 1001 ✓ KABUL

DİKKAT: (0∪1) tek karakter seçimi, (0∪1)* ise 0+ karakter!`,
`Core skill: Determining which strings a regex accepts/rejects.

Strategy:
  1. Break regex into parts (precedence: * > ∘ > ∪)
  2. Analyze from innermost part outward
  3. Check edge cases: ε, single char, very long

Exercise — Are these strings accepted by (0∪1)*0(0∪1)?

  "00"  → (0∪1)*=ε, 0, (0∪1)=0 → 00 ✓ ACCEPT
  "010" → need to match: (0∪1)* then 0 then single (0∪1)
        → (0∪1)*=01 but then need 0+(0∪1) = 2 more chars → only 0 left → REJECT
  "100" → (0∪1)*=1, 0=0, (0∪1)=0 → 100 ✓ ACCEPT
  "0"   → (0∪1)* and 0 and (0∪1) need minimum 2 chars → REJECT
  "1001"→ (0∪1)*=10, 0=0, (0∪1)=1 → 1001 ✓ ACCEPT

CAUTION: (0∪1) is a single character choice, (0∪1)* is 0+ characters!`]},
  {hd:["✏️ Regex Yazma (Dil→RE)","✏️ Regex Construction (Language→RE)"],body:[
`Ters beceri: Verilen bir dil tanımı için doğru regex yazmak.

Adım adım yaklaşım:
  1. Dilin özelliklerini listele
  2. Her özelliği regex parçasına çevir
  3. Parçaları birleştir

Yaygın desenler:
  "x ile başlar"      → x(a∪b)*
  "x ile biter"       → (a∪b)*x
  "x içerir"          → (a∪b)*x(a∪b)*
  "uzunluk çift"      → ((a∪b)(a∪b))*
  "tam olarak 2 a"    → b*ab*ab*
  "en az 1 a"         → (a∪b)*a(a∪b)*
  "a yok"             → b*

Zor örnek: "tek uzunluklu stringler, Σ={a,b}"
  → (a∪b)((a∪b)(a∪b))*
  Açıklama: 1 karakter + çift sayıda karakter = tek uzunluk

Tuzaklar:
  ✗ a*b* ≠ (ab)*  → a*b* = {ε,a,b,aab,abb,...} vs (ab)* = {ε,ab,abab,...}
  ✗ (a∪b)* ≠ a*∪b* → (a∪b)* = tüm stringler, a*∪b* = sadece a veya sadece b
  ✗ Boş string unutma! a* = {ε,a,aa,...} çünkü * 0 tekrarı içerir`,
`Reverse skill: Writing correct regex for a given language description.

Step-by-step approach:
  1. List language properties
  2. Convert each property to a regex part
  3. Combine parts

Common patterns:
  "starts with x"      → x(a∪b)*
  "ends with x"        → (a∪b)*x
  "contains x"         → (a∪b)*x(a∪b)*
  "even length"        → ((a∪b)(a∪b))*
  "exactly 2 a's"      → b*ab*ab*
  "at least 1 a"       → (a∪b)*a(a∪b)*
  "no a's"             → b*

Hard example: "odd-length strings, Σ={a,b}"
  → (a∪b)((a∪b)(a∪b))*
  Explanation: 1 char + even number of chars = odd length

Pitfalls:
  ✗ a*b* ≠ (ab)*  → a*b* = {ε,a,b,aab,abb,...} vs (ab)* = {ε,ab,abab,...}
  ✗ (a∪b)* ≠ a*∪b* → (a∪b)* = all strings, a*∪b* = only a's or only b's
  ✗ Don't forget empty string! a* = {ε,a,aa,...} because * includes 0 repeats`]}
 ],
 quiz:[
  {q:["(a∪b)*a ile biten stringler nelerdir?","What strings does (a∪b)*a describe?"],
   opts:[["Sadece 'a'","Only 'a'"],["'a' ile biten tüm stringler","All strings ending with 'a'"],["'a' içeren stringler","Strings containing 'a'"]],ans:1,
   expl:["(a∪b)* = herhangi bir string, sonra a = 'a' ile bitmeli.","(a∪b)* = any string, then a = must end with 'a'."]},
  {q:["Pumping Lemma ne ispatlar?","What does Pumping Lemma prove?"],
   opts:[["Bir dilin düzenli olduğunu","A language is regular"],["Bir dilin düzenli OLMADIĞINI","A language is NOT regular"],["DFA = NFA","DFA = NFA"]],ans:1,
   expl:["PL çelişki ile düzenli OLMADIĞINI ispatlar. Düzenli olduğunu ispatlamaz!","PL proves NOT regular by contradiction. It does NOT prove regularity!"]},
  {q:["a(b∪c)* hangi stringleri kabul eder?","What strings does a(b∪c)* accept?"],
   opts:[["a ile başlayıp b ve c'lerle devam eden","Starting with a, then any b's and c's"],["Sadece abc","Only abc"],["a veya b veya c","a or b or c"]],ans:0,
   expl:["a zorunlu, sonra (b∪c)* = b ve c'nin herhangi bir kombinasyonu (boş dahil). Örnek: a, ab, acc, abcbc.","a required, then (b∪c)* = any combination of b and c (including empty). Ex: a, ab, acc, abcbc."]},
  {q:["{0ⁿ1ⁿ | n≥0} düzenli midir?","Is {0ⁿ1ⁿ | n≥0} regular?"],
   opts:[["Evet, basit DFA","Yes, simple DFA"],["Hayır, Pumping Lemma ile ispatlanır","No, proven by Pumping Lemma"],["Bilinemez","Unknown"]],ans:1,
   expl:["Klasik PL örneği: w=0ᵖ1ᵖ seç, herhangi bölümlemede y=0ᵏ, xyyz=0ᵖ⁺ᵏ1ᵖ → eşit değil → çelişki.","Classic PL example: choose w=0ᵖ1ᵖ, any partition y=0ᵏ, xyyz=0^(p+k)1^p → unequal → contradiction."]},
  {q:["'101' stringi (0∪1)*1(0∪1)* tarafından kabul edilir mi?","Is '101' accepted by (0∪1)*1(0∪1)*?"],
   opts:[["Evet","Yes"],["Hayır","No"],["Belirsiz","Ambiguous"]],ans:0,
   expl:["(0∪1)*=1, 1=0 ❌ OLMAZ. (0∪1)*=ε, 1=1, (0∪1)*=01 ✓ KABUL. En az 1 yol yeterli.","(0∪1)*=ε, 1=1, (0∪1)*=01 ✓ ACCEPT. At least 1 valid decomposition suffices."]},
  {q:["a*b* ile (ab)* aynı dili tanımlar mı?","Do a*b* and (ab)* define the same language?"],
   opts:[["Evet","Yes"],["Hayır, a*b* daha geniş","No, a*b* is broader"],["Hayır, (ab)* daha geniş","No, (ab)* is broader"]],ans:1,
   expl:["a*b* = {ε,a,b,aa,ab,aab,abb,...} ama (ab)* = {ε,ab,abab,...}. 'a' ∈ a*b* ama 'a' ∉ (ab)*.","a*b* = {ε,a,b,aa,ab,aab,abb,...} but (ab)* = {ε,ab,abab,...}. 'a' ∈ a*b* but 'a' ∉ (ab)*."]},
  {q:["'a içerir' dilinin regex'i nedir? Σ={a,b}","Regex for 'contains a'? Σ={a,b}"],
   opts:[["a*","a*"],["(a∪b)*a(a∪b)*","(a∪b)*a(a∪b)*"],["a(a∪b)*","a(a∪b)*"]],ans:1,
   expl:["Herhangi yerde a: önce herhangi string, sonra a, sonra herhangi string = (a∪b)*a(a∪b)*.","a anywhere: any string, then a, then any string = (a∪b)*a(a∪b)*."]},
  {q:["(a∪b)* ile a*∪b* aynı mıdır?","Are (a∪b)* and a*∪b* the same?"],
   opts:[["Evet","Yes"],["Hayır — (a∪b)* daha geniş","No — (a∪b)* is broader"],["Hayır — a*∪b* daha geniş","No — a*∪b* is broader"]],ans:1,
   expl:["(a∪b)* = TÜM stringler (ab dahil). a*∪b* = sadece a'lardan VEYA sadece b'lerden oluşan stringler. 'ab' ∈ (a∪b)* ama 'ab' ∉ a*∪b*.","(a∪b)* = ALL strings (including ab). a*∪b* = only all-a's OR all-b's strings. 'ab' ∈ (a∪b)* but 'ab' ∉ a*∪b*."]},
  // ── Faz 3+: M3 extended quizzes ──
  {type:"multi",
   q:["Hangi stringler (a∪b)*aba tarafından kabul edilir?","Which strings are accepted by (a∪b)*aba?"],
   strings:[["aba","aba"],["baba","baba"],["ab","ab"],["aaba","aaba"],["abab","abab"]],
   accept:[0,1,3],
   expl:["Regex 'aba' ile bitmeli. aba✓, baba✓, ab✗(ab ile biter), aaba✓, abab✗(ab ile biter).",
         "Regex must end with 'aba'. aba✓, baba✓, ab✗(ends with ab), aaba✓, abab✗(ends with ab)."]},
  {type:"match",
   q:["Regex ↔ Dil eşleştirmesi yapın:","Match Regex ↔ Language:"],
   left:[["a*b","a*b"],["(ab)*","(ab)*"],["a∪b","a∪b"]],
   right:[["{b, ab, aab, …}","{b, ab, aab, …}"],["{ε, ab, abab, …}","{ε, ab, abab, …}"],["{a, b}","{a, b}"]],
   pairs:[[0,0],[1,1],[2,2]],
   expl:["a*b = 0+ a sonra b; (ab)* = ab tekrarı; a∪b = tek karakter seçimi.","a*b = 0+ a's then b; (ab)* = repeat ab; a∪b = single char choice."]},
  {type:"order",
   q:["Pumping Lemma ispatı adımlarını sırala:","Order the Pumping Lemma proof steps:"],
   items:[["L'nin düzenli olduğunu varsay","Assume L is regular"],["p al, w ∈ L seç (|w|≥p)","Take p, choose w ∈ L (|w|≥p)"],["Her xyz bölümlemesi için","For any partition xyz"],["xyⁱz ∉ L olan i bul → çelişki","Find i where xyⁱz ∉ L → contradiction"]],
   correctOrder:[0,1,2,3],
   expl:["Varsay → string seç → herhangi bölümleme → çelişki bul. Bu 'oyun' yapısıdır.",
         "Assume → choose string → any partition → find contradiction. This is the 'game' structure."]},
  {q:["NFA→DFA dönüşümünde en kötü durum kaç DFA durumu olabilir?","Worst case DFA states from NFA→DFA conversion?"],
   opts:[["n","n"],["n²","n²"],["2ⁿ","2ⁿ"]],ans:2,
   expl:["n durumlu NFA → en kötü 2ⁿ DFA durumu (subset construction, her alt küme bir DFA durumu).","n-state NFA → worst case 2ⁿ DFA states (subset construction, each subset is a DFA state)."]},
  {q:["GNFA'da kaç başlangıç ve kaç kabul durumu olur?","How many start and accept states does a GNFA have?"],
   opts:[["1 başlangıç, 1+ kabul","1 start, 1+ accept"],["1 başlangıç, tam 1 kabul","1 start, exactly 1 accept"],["1+ başlangıç, 1+ kabul","1+ start, 1+ accept"]],ans:1,
   expl:["GNFA'da tam 1 başlangıç (girişsiz) ve tam 1 kabul (çıkışsız) durumu olur. Kenarlar regex taşır.","GNFA has exactly 1 start (no incoming) and 1 accept (no outgoing). Edges carry regex."]},
  {q:["Düzenli diller hangi işlemler altında kapalıdır?","Regular languages are closed under which operations?"],
   opts:[["∪, ∩, ∘, *, ∁ (hepsi)","∪, ∩, ∘, *, ∁ (all)"],["Sadece ∪ ve ∩","Only ∪ and ∩"],["Sadece ∪ ve *","Only ∪ and *"]],ans:0,
   expl:["Düzenli diller TÜM bu işlemler altında kapalıdır: birleşim, kesişim, birleştirme, yıldız, tümleme.","Regular languages are closed under ALL: union, intersection, concatenation, star, complement."]}
 ]},

// ─────────────────────────────────────────────────────────────
// M4: CFG & PDA
// ─────────────────────────────────────────────────────────────
{id:"m4",c:C.ch2,nm:["📝 CFG & PDA","📝 CFG & PDA"],
 sub:["Bağlamdan Bağımsız Gramerler & Yığınlı Otomat","Context-Free Grammars & Pushdown Automata"],
 pre:["m1","m2","m3"],
 sections:[
  {hd:["CFG Tanımı (Sipser 2.2)","CFG Definition (Sipser 2.2)"],body:[
`CFG = (V, Σ, R, S)
  V = Değişkenler (nonterminals)
  Σ = Terminaller (alfabe)
  R = Kurallar (production rules): A → w
  S = Başlangıç değişkeni

Örnek — {0ⁿ1ⁿ}:
  S → 0S1 | ε

Türetme: S ⇒ 0S1 ⇒ 00S11 ⇒ 0011

CFG'nin gücü DFA/NFA'dan FAZLADIR. Parantez eşleme, palindrom, iç içe yapılar tanınabilir.`,
`CFG = (V, Σ, R, S)
  V = Variables (nonterminals)
  Σ = Terminals (alphabet)
  R = Rules (productions): A → w
  S = Start variable

Example — {0ⁿ1ⁿ}:
  S → 0S1 | ε

Derivation: S ⇒ 0S1 ⇒ 00S11 ⇒ 0011

CFG is MORE POWERFUL than DFA/NFA. Can recognize parenthesis matching, palindromes, nested structures.`]},
  {hd:["PDA Tanımı (Sipser 2.13)","PDA Definition (Sipser 2.13)"],body:[
`PDA = DFA + STACK (yığın)

  M = (Q, Σ, Γ, δ, q₀, F)

  Γ = Stack alfabesi
  δ : Q × (Σ∪{ε}) × (Γ∪{ε}) → P(Q × (Γ∪{ε}))

Her adımda: sembol oku + stack'ten pop + stack'e push

Stack LIFO: Last In, First Out. Bu sonsuz hafıza sağlar (DFA'nın sonlu hafızasına karşı).

Teorem 2.20: CFG ≡ PDA (aynı dilleri tanırlar)`,
`PDA = DFA + STACK

  M = (Q, Σ, Γ, δ, q₀, F)

  Γ = Stack alphabet
  δ : Q × (Σ∪{ε}) × (Γ∪{ε}) → P(Q × (Γ∪{ε}))

Each step: read symbol + pop from stack + push to stack

Stack is LIFO: Last In, First Out. This provides unbounded memory (vs DFA's finite memory).

Theorem 2.20: CFG ≡ PDA (recognize the same languages)`]}
 ],
 quiz:[
  {q:["PDA'nın DFA'dan farkı nedir?","What distinguishes PDA from DFA?"],
   opts:[["Daha fazla durumu var","More states"],["Stack (yığın) var","Has a stack"],["Daha hızlı","Faster"]],ans:1,
   expl:["PDA = DFA + Stack. Stack sonsuz hafıza sağlar.","PDA = DFA + Stack. Stack provides unbounded memory."]},
  {q:["S → 0S1 | ε grameri hangi dili üretir?","What language does S → 0S1 | ε generate?"],
   opts:[["0*1*","0*1*"],["{0ⁿ1ⁿ | n≥0}","{0ⁿ1ⁿ | n≥0}"],["(01)*","(01)*"]],ans:1,
   expl:["Her adımda dıştan 0…1 eklenir: 0ⁿ1ⁿ. İç içe yapı.","Each step wraps 0…1 around: 0ⁿ1ⁿ. Nested structure."]},
  {q:["0ⁿ1ⁿ PDA'sını 0ⁿ1²ⁿ'e dönüştürmek için ne değişir?","How to change 0ⁿ1ⁿ PDA to 0ⁿ1²ⁿ?"],
   opts:[["Her 0 için 2 kez push","Push twice per 0"],["Her 1 için 2 kez pop","Pop twice per 1"],["Yeni durum ekle","Add new state"]],ans:0,
   expl:["Her 0 okuyunca stack'e 2 sembol push et. Böylece n tane 0 → 2n sembol → 2n tane 1 ile eşleşir.","Push 2 symbols per 0. So n 0's → 2n symbols → matches 2n 1's."]},
  {q:["PDA neden {aⁿbⁿcⁿ} diline karar veremez?","Why can't PDA decide {aⁿbⁿcⁿ}?"],
   opts:[["Stack sadece 1 sayaç tutar","Stack holds only 1 counter"],["Alfabe çok büyük","Alphabet too large"],["Durum sayısı yetmez","Not enough states"]],ans:0,
   expl:["Stack tek bir LIFO sayaç. a=b'yi saydıktan sonra c'yi sayacak ikinci sayaç yok.","Stack is a single LIFO counter. After matching a=b, no second counter for c."]},
  // ── Faz 3+: M4 extended quizzes ──
  {type:"multi",
   q:["Hangi diller bağlamdan bağımsızdır (CFL)?","Which languages are context-free (CFL)?"],
   strings:[["{aⁿbⁿ | n≥0}","{aⁿbⁿ | n≥0}"],["{wwᴿ | w∈{a,b}*}","{wwᴿ | w∈{a,b}*}"],["{aⁿbⁿcⁿ}","{aⁿbⁿcⁿ}"],["{aⁿ | n asal}","{aⁿ | n prime}"]],
   accept:[0,1],
   expl:["aⁿbⁿ = S→aSb|ε (CFL). wwᴿ = palindrom = S→aSa|bSb|ε (CFL). aⁿbⁿcⁿ CFL DEĞİL (3 sayaç). aⁿ(asal) CFL DEĞİL.",
         "aⁿbⁿ = S→aSb|ε (CFL). wwᴿ = palindrome = S→aSa|bSb|ε (CFL). aⁿbⁿcⁿ NOT CFL (3 counters). aⁿ(prime) NOT CFL."]},
  {type:"match",
   q:["CFG ↔ Üretilen dili eşleştirin:","Match CFG ↔ Generated language:"],
   left:[["S→aSb|ε","S→aSb|ε"],["S→aSa|bSb|a|b|ε","S→aSa|bSb|a|b|ε"],["S→SS|(S)|ε","S→SS|(S)|ε"]],
   right:[["{aⁿbⁿ | n≥0}","{aⁿbⁿ | n≥0}"],["Palindromlar","Palindromes"],["Dengeli parantezler","Balanced parentheses"]],
   pairs:[[0,0],[1,1],[2,2]],
   expl:["S→aSb|ε → aⁿbⁿ; S→aSa|bSb|… → palindrom; S→SS|(S)|ε → dengeli parantezler.",
         "S→aSb|ε → aⁿbⁿ; S→aSa|bSb|… → palindromes; S→SS|(S)|ε → balanced parentheses."]},
  {q:["CFG ambiguous (belirsiz) ne demek?","What does it mean for a CFG to be ambiguous?"],
   opts:[["Birden fazla kuralı var","Has multiple rules"],["Bir string için birden fazla türetme ağacı var","A string has multiple parse trees"],["Sonsuz dil üretir","Generates infinite language"]],ans:1,
   expl:["Ambiguous CFG: en az 1 string için 2+ farklı leftmost derivation (= farklı parse tree) var.",
         "Ambiguous CFG: at least 1 string has 2+ different leftmost derivations (= different parse trees)."]},
  {q:["Chomsky Normal Form (CNF) kuralları ne şekildedir?","What form do Chomsky Normal Form rules take?"],
   opts:[["A → BC veya A → a","A → BC or A → a"],["A → BCD veya A → a","A → BCD or A → a"],["A → aB veya A → ε","A → aB or A → ε"]],ans:0,
   expl:["CNF: Her kural ya A→BC (2 değişken) ya da A→a (1 terminal). S→ε sadece başlangıç için izin verilir.",
         "CNF: Each rule is either A→BC (2 variables) or A→a (1 terminal). S→ε only allowed for start."]},
  {q:["CFL'ler hangi işlem altında kapalı DEĞİLDİR?","CFLs are NOT closed under which operation?"],
   opts:[["Birleşim (∪)","Union (∪)"],["Kesişim (∩)","Intersection (∩)"],["Birleştirme (∘)","Concatenation (∘)"]],ans:1,
   expl:["CFL'ler ∪, ∘, * altında kapalı ama ∩ ve ∁ altında KAPALI DEĞİL! {aⁿbⁿcᵐ} ∩ {aᵐbⁿcⁿ} = {aⁿbⁿcⁿ} ∉ CFL.",
         "CFLs closed under ∪, ∘, * but NOT ∩ and ∁! {aⁿbⁿcᵐ} ∩ {aᵐbⁿcⁿ} = {aⁿbⁿcⁿ} ∉ CFL."]}
 ],sandbox:"pda"},

// ─────────────────────────────────────────────────────────────
// M5: TM & Church-Turing
// ─────────────────────────────────────────────────────────────
{id:"m5",c:C.ch3,nm:["🖥️ TM","🖥️ Turing Machine"],
 sub:["Turing Makinesi & Church-Turing Tezi","Turing Machine & Church-Turing Thesis"],
 pre:["m1","m2","m3","m4"],
 sections:[
  {hd:["Tanım (Sipser 3.3)","Definition (Sipser 3.3)"],body:[
`TM = (Q, Σ, Γ, δ, q₀, q_accept, q_reject)

  Γ = Bant alfabesi (Σ ⊂ Γ, ␣ ∈ Γ)
  δ : Q × Γ → Q × Γ × {L, R}

Farklar:
  • Sonsuz bant (iki yönlü okuma/yazma)
  • Yazma yeteneği (DFA/NFA yapamaz)
  • Sola ve sağa hareket
  • Kabul ve red durumları (hesaplama bitince)

TM programlanabilir bir bilgisayardır. Her algoritma bir TM olarak modellenebilir.`,
`TM = (Q, Σ, Γ, δ, q₀, q_accept, q_reject)

  Γ = Tape alphabet (Σ ⊂ Γ, ␣ ∈ Γ)
  δ : Q × Γ → Q × Γ × {L, R}

Differences from DFA/PDA:
  • Infinite tape (bidirectional read/write)
  • Write capability (DFA/NFA cannot)
  • Move left and right
  • Accept and reject states (halting)

TM is a programmable computer. Every algorithm can be modeled as a TM.`]},
  {hd:["Church-Turing Tezi","Church-Turing Thesis"],body:[
`Church-Turing Tezi (teorem değil, TEZ):

  "Sezgisel olarak hesaplanabilir her fonksiyon bir Turing makinesi tarafından hesaplanabilir."

Bu ispat edilemez çünkü "sezgisel hesaplanabilirlik" biçimsel bir kavram değildir.

Sonuçları:
  1. TM = Python = Java = C++ (hesaplama gücünde)
  2. TM'nin yapamadığını HİÇBİR bilgisayar yapamaz
  3. Karar verilemez (undecidable) problemler VAR!

Örnek: Halting Problem — bir programın durup durmayacağını belirleyen genel bir algoritma YOKTUR (Teorem 4.11).`,
`Church-Turing Thesis (not a theorem, a THESIS):

  "Every intuitively computable function is computable by a Turing machine."

This cannot be proven because "intuitive computability" is not a formal concept.

Consequences:
  1. TM = Python = Java = C++ (in computational power)
  2. What TM can't do, NO computer can do
  3. Undecidable problems EXIST!

Example: Halting Problem — there is NO general algorithm that determines whether a program halts (Theorem 4.11).`]},
  {hd:["Hesaplama Hiyerarşisi","Computation Hierarchy"],body:[
`Dillerin sınıflandırması (dar → geniş):

  Düzenli ⊂ Bağlamdan Bağımsız ⊂ Karar Verilebilir ⊂ Tanınabilir

  DFA/NFA/RE    → Düzenli Diller
  CFG/PDA       → Bağlamdan Bağımsız Diller
  TM (durur)    → Karar Verilebilir Diller
  TM (durmayabilir) → Tanınabilir Diller

Her katman bir öncekini KESİNLİKLE içerir:
  • {0ⁿ1ⁿ} CFL ama düzenli değil
  • {aⁿbⁿcⁿ} karar verilebilir ama CFL değil
  • Halting Problem tanınabilir ama karar verilebilir değil`,
`Language classification (narrow → broad):

  Regular ⊂ Context-Free ⊂ Decidable ⊂ Recognizable

  DFA/NFA/RE    → Regular Languages
  CFG/PDA       → Context-Free Languages
  TM (halts)    → Decidable Languages
  TM (may not halt) → Recognizable Languages

Each level STRICTLY contains the previous:
  • {0ⁿ1ⁿ} is CFL but not regular
  • {aⁿbⁿcⁿ} is decidable but not CFL
  • Halting Problem is recognizable but not decidable`]}
 ],
 quiz:[
  {q:["TM'nin DFA'dan temel farkı?","Fundamental difference between TM and DFA?"],
   opts:[["Daha fazla durumu var","More states"],["Banta yazabilir + sola gidebilir","Can write to tape + move left"],["Daha hızlı çalışır","Runs faster"]],ans:1,
   expl:["TM okuyup yazabilir ve iki yönde hareket edebilir. Bu onu evrensel hesaplama modeli yapar.","TM can read/write and move both directions. This makes it a universal computation model."]},
  {q:["Halting Problem nedir?","What is the Halting Problem?"],
   opts:[["Bir programın ne kadar sürede biteceği","How long a program takes"],["Bir programın durup durmayacağını belirleme","Determining if a program halts"],["En hızlı algoritmayı bulma","Finding the fastest algorithm"]],ans:1,
   expl:["Bir programın durup durmayacağını belirleyen genel bir algoritma yoktur — karar verilemez!","No general algorithm can determine if a program halts — undecidable!"]},
  {q:["TM bandına '010' yazılı ve kafa pozisyon 0'da. δ(q0,0)=(q0,1,R) uygulandıktan sonra bant?","TM tape has '010', head at 0. After δ(q0,0)=(q0,1,R), what's the tape?"],
   opts:[["110, kafa pozisyon 1","110, head at 1"],["010, kafa pozisyon 1","010, head at 1"],["011, kafa pozisyon 0","011, head at 0"]],ans:0,
   expl:["0 oku → 1 yaz → sağa git. Bant: 1-1-0, kafa artık pozisyon 1'de.","Read 0 → write 1 → move right. Tape: 1-1-0, head now at position 1."]},
  {q:["Hesaplama hiyerarşisinde doğru sıralama?","Correct computation hierarchy order?"],
   opts:[["Düzenli ⊂ CFL ⊂ Karar Verilebilir ⊂ Tanınabilir","Regular ⊂ CFL ⊂ Decidable ⊂ Recognizable"],["CFL ⊂ Düzenli ⊂ Tanınabilir ⊂ Karar Verilebilir","CFL ⊂ Regular ⊂ Recognizable ⊂ Decidable"],["Düzenli = CFL ⊂ Karar Verilebilir","Regular = CFL ⊂ Decidable"]],ans:0,
   expl:["Düzenli ⊂ CFL ⊂ Karar Verilebilir ⊂ Tanınabilir. Her katman bir öncekini kesinlikle içerir.","Regular ⊂ CFL ⊂ Decidable ⊂ Recognizable. Each level strictly contains the previous."]},
  // ── Faz 3+: M5 extended quizzes ──
  {type:"order",
   q:["Hesaplama hiyerarşisini dardan genişe sıralayın:","Order the computation hierarchy from narrow to broad:"],
   items:[["Düzenli (DFA/NFA)","Regular (DFA/NFA)"],["Bağlamdan Bağımsız (CFG/PDA)","Context-Free (CFG/PDA)"],["Karar Verilebilir (TM durur)","Decidable (TM halts)"],["Tanınabilir (TM durmayabilir)","Recognizable (TM may not halt)"]],
   correctOrder:[0,1,2,3],
   expl:["Düzenli ⊂ CFL ⊂ Decidable ⊂ Recognizable. Her katman bir öncekini kesinlikle içerir.",
         "Regular ⊂ CFL ⊂ Decidable ⊂ Recognizable. Each level strictly contains the previous."]},
  {type:"multi",
   q:["Hangileri karar verilebilir (decidable) problemlerdir?","Which are decidable problems?"],
   strings:[["DFA boş mu?","Is DFA empty?"],["DFA'lar eşdeğer mi?","Are DFAs equivalent?"],["CFG boş mu?","Is CFG empty?"],["TM boş mu?","Is TM empty?"]],
   accept:[0,1,2],
   expl:["DFA boşluk, DFA eşdeğerlik ve CFG boşluk karar verilebilir. TM boşluk KARAR VERİLEMEZ (Rice Teoremi).",
         "DFA emptiness, DFA equivalence, and CFG emptiness are decidable. TM emptiness is UNDECIDABLE (Rice's Theorem)."]},
  {type:"match",
   q:["Makine ↔ Güç eşleştirmesi:","Match Machine ↔ Power:"],
   left:[["DFA","DFA"],["PDA","PDA"],["TM","TM"]],
   right:[["Sonlu hafıza","Finite memory"],["Yığın hafıza (LIFO)","Stack memory (LIFO)"],["Sonsuz bant (okuma/yazma)","Infinite tape (read/write)"]],
   pairs:[[0,0],[1,1],[2,2]],
   expl:["DFA=sonlu durum, PDA=DFA+stack, TM=sonsuz bant. Her biri bir öncekinden güçlü.",
         "DFA=finite states, PDA=DFA+stack, TM=infinite tape. Each more powerful than the last."]}
 ],sandbox:"tm"},
];

// ═══ Academy Component ═══════════════════════════════════════
export { MODULES };
export default function Academy({onSandbox}) {
  const{lang}=useI18n();
  const li=lang==="en"?1:0;
  const[active,setActive]=useState(null); // module id
  const[openSec,setOpenSec]=useState({}); // section toggles
  const[quizAns,setQuizAns]=useState({}); // quiz answers
  const[showQuiz,setShowQuiz]=useState(false);
  const[showTrace,setShowTrace]=useState(false);
  const[quizSeed,setQuizSeed]=useState(()=>Date.now()); // for quiz shuffle
  const[multiSel,setMultiSel]=useState({}); // Faz 3: multi-select quiz answers
  const[matchAns,setMatchAns]=useState({}); // Faz 3: match quiz answers
  const[orderAns,setOrderAns]=useState({}); // Faz 3: order quiz answers

  // ── Faz 1: Progress System ──────────────────────────────────
  const[progress,setProgress]=useState(()=>{
    try{const raw=localStorage.getItem("otomata_progress");if(raw)return JSON.parse(raw);}catch(e){}
    const init={};
    MODULES.forEach(m=>{init[m.id]={unlocked:true,quizCorrect:0,quizTotal:m.quiz?.length||0,completed:false,quizAnswered:{}};});
    return init;
  });

  const saveProgress=useCallback((p)=>{
    setProgress(p);
    try{localStorage.setItem("otomata_progress",JSON.stringify(p));}catch(e){}
  },[]);

  // All modules unlocked — free navigation
  const isUnlocked=useCallback(()=>true,[]);

  // Recalculate unlocks whenever progress changes
  const effectiveProgress=useMemo(()=>{
    const p={...progress};
    MODULES.forEach(m=>{
      if(p[m.id]) p[m.id]={...p[m.id], unlocked: m.id==="m0"||isUnlocked(m.id)};
    });
    return p;
  },[progress,isUnlocked]);

  const getStatus=(modId)=>{
    const mp=effectiveProgress[modId];
    if(!mp) return "locked";
    if(!mp.unlocked) return "locked";
    if(mp.completed) return "completed";
    if(mp.quizCorrect>0||Object.keys(mp.quizAnswered||{}).length>0) return "started";
    return "unlocked";
  };

  // Dashboard stats
  const stats=useMemo(()=>{
    let totalCorrect=0, totalQuiz=0, completedMods=0;
    MODULES.forEach(m=>{
      const mp=effectiveProgress[m.id];
      if(mp){totalCorrect+=mp.quizCorrect;totalQuiz+=mp.quizTotal;if(mp.completed)completedMods++;}
    });
    return{totalCorrect,totalQuiz,completedMods,totalMods:MODULES.length};
  },[effectiveProgress]);

  const mod=active?MODULES.find(m=>m.id===active):null;

  const togSec=i=>setOpenSec(p=>({...p,[i]:!p[i]}));

  // Quiz answer with progress tracking
  const answer=(qi,oi)=>{
    setQuizAns(p=>({...p,[qi]:oi}));
    // Update progress
    const newP={...progress};
    const mp={...newP[mod.id]};
    mp.quizAnswered={...mp.quizAnswered,[qi]:oi};
    // Recount correct
    let correct=0;
    mod.quiz.forEach((qz,idx)=>{
      if(!qz.type||qz.type==="mc") { if(mp.quizAnswered[idx]===qz.ans) correct++; }
      else if(mp.quizAnswered[idx]===true) correct++; // non-mc types store true/false
    });
    mp.quizCorrect=correct;
    mp.completed=correct===mp.quizTotal && mp.quizTotal>0;
    newP[mod.id]=mp;
    saveProgress(newP);
  };

  // Faz 3: Multi-select answer
  const answerMulti=(qi, userSel, correctSet)=>{
    const allCorrect = userSel.size===correctSet.size && [...correctSet].every(i=>userSel.has(i));
    setQuizAns(p=>({...p,[qi]:allCorrect}));
    const newP={...progress};const mp={...newP[mod.id]};
    mp.quizAnswered={...mp.quizAnswered,[qi]:allCorrect?true:false};
    let correct=0;
    mod.quiz.forEach((qz,idx)=>{ if(!qz.type||qz.type==="mc"){if(mp.quizAnswered[idx]===qz.ans)correct++;}else if(mp.quizAnswered[idx]===true)correct++;});
    mp.quizCorrect=correct;mp.completed=correct===mp.quizTotal&&mp.quizTotal>0;newP[mod.id]=mp;saveProgress(newP);
  };

  // Faz 3: Match answer
  const answerMatch=(qi, userMatch, pairs)=>{
    const allCorrect = pairs.every(([l,r])=>userMatch[l]===r);
    setQuizAns(p=>({...p,[qi]:allCorrect}));
    const newP={...progress};const mp={...newP[mod.id]};
    mp.quizAnswered={...mp.quizAnswered,[qi]:allCorrect?true:false};
    let correct=0;
    mod.quiz.forEach((qz,idx)=>{ if(!qz.type||qz.type==="mc"){if(mp.quizAnswered[idx]===qz.ans)correct++;}else if(mp.quizAnswered[idx]===true)correct++;});
    mp.quizCorrect=correct;mp.completed=correct===mp.quizTotal&&mp.quizTotal>0;newP[mod.id]=mp;saveProgress(newP);
  };

  // Faz 3: Order answer
  const answerOrder=(qi, userOrd, correctOrder)=>{
    const allCorrect = correctOrder.every((c,i)=>userOrd[i]===c);
    setQuizAns(p=>({...p,[qi]:allCorrect}));
    const newP={...progress};const mp={...newP[mod.id]};
    mp.quizAnswered={...mp.quizAnswered,[qi]:allCorrect?true:false};
    let correct=0;
    mod.quiz.forEach((qz,idx)=>{ if(!qz.type||qz.type==="mc"){if(mp.quizAnswered[idx]===qz.ans)correct++;}else if(mp.quizAnswered[idx]===true)correct++;});
    mp.quizCorrect=correct;mp.completed=correct===mp.quizTotal&&mp.quizTotal>0;newP[mod.id]=mp;saveProgress(newP);
  };

  const openModule=id=>{
    setActive(id);setOpenSec({});setShowQuiz(false);setShowTrace(false);
    setMultiSel({});setMatchAns({});setOrderAns({});
    // Restore saved quiz answers for this module
    const mp=progress[id];
    setQuizAns(mp?.quizAnswered||{});
  };

  const resetAllProgress=()=>{
    const init={};
    MODULES.forEach(m=>{init[m.id]={unlocked:true,quizCorrect:0,quizTotal:m.quiz?.length||0,completed:false,quizAnswered:{}};});
    saveProgress(init);
  };

  // ── Faz 2: Trace exercises for current module ───────────────
  const moduleTraces=mod?TRACE_EXERCISES.filter(t=>t.module===mod.id):[];
  const moduleBuilds=mod?BUILD_CHALLENGES.filter(b=>b.module===mod.id):[];

  // ── Module List (Learning Path) ────────────────────────────
  if(!mod) return(
    <div style={{animation:"fadeIn .3s ease-out",maxWidth:800}}>
      <div style={{marginBottom:20}}>
        <h2 style={{fontSize:22,fontWeight:900,color:C.wh,fontFamily:F.s,margin:"0 0 6px"}}>
          {li?"Otomata Academy":"Otomata Akademi"} 🎓
        </h2>
        <p style={{fontSize:13,color:C.ts,fontFamily:F.s,lineHeight:1.6,margin:0}}>
          {li?"Follow the learning path from foundations to Turing machines. Each module builds on the previous one.":"Temellerden Turing makinelerine öğrenme yolunu takip et. Her modül bir öncekinin üzerine inşa edilir."}
        </p>
      </div>

      {/* ── Progress Dashboard ── */}
      <Card color={C.ch1} pad={16} style={{marginBottom:18}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:C.ts,fontFamily:F.s,textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>
              {li?"Your Progress":"İlerlemen"}
            </div>
            <div style={{display:"flex",gap:16,alignItems:"baseline"}}>
              <div>
                <span style={{fontSize:24,fontWeight:900,color:C.wh,fontFamily:F.m}}>{stats.completedMods}</span>
                <span style={{fontSize:12,color:C.ts,fontFamily:F.s}}>/{stats.totalMods} {li?"modules":"modül"}</span>
              </div>
              <div>
                <span style={{fontSize:24,fontWeight:900,color:C.warn,fontFamily:F.m}}>{stats.totalCorrect}</span>
                <span style={{fontSize:12,color:C.ts,fontFamily:F.s}}>/{stats.totalQuiz} quiz</span>
              </div>
            </div>
          </div>
          <button onClick={resetAllProgress} style={{padding:"5px 10px",borderRadius:6,
            background:C.gl2,border:`1px solid ${C.bd}`,color:C.tm,fontSize:9,fontWeight:600,fontFamily:F.s}}>
            ↻ {li?"Reset":"Sıfırla"}
          </button>
        </div>
        {/* Progress bar */}
        <div style={{marginTop:10,height:6,borderRadius:3,background:C.s2,overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:3,
            background:`linear-gradient(90deg,${C.ch1},${C.ch2})`,
            width:`${stats.totalQuiz>0?(stats.totalCorrect/stats.totalQuiz*100):0}%`,
            transition:"width .4s ease"}}/>
        </div>
        <div style={{marginTop:4,fontSize:9,color:C.ts,fontFamily:F.s,textAlign:"right"}}>
          {Math.round(stats.totalQuiz>0?(stats.totalCorrect/stats.totalQuiz*100):0)}%
        </div>
      </Card>

      {/* Path visualization */}
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        {MODULES.map((m,i)=>{
          const status=getStatus(m.id);
          const isLocked=status==="locked";
          const isCompleted=status==="completed";
          const isStarted=status==="started";
          const mp=effectiveProgress[m.id];
          const preqNames=m.pre?m.pre.map(pid=>MODULES.find(x=>x.id===pid)?.nm[li]).filter(Boolean):[];

          const statusIcon=isCompleted?"✅":isLocked?"🔒":isStarted?"🔄":"";
          const statusColor=isCompleted?C.ok:isLocked?C.tm:isStarted?C.warn:m.c;

          return(
            <div key={m.id}>
              {/* Connector line */}
              {i>0&&<div style={{width:2,height:16,background:isLocked?`${C.tm}20`:`${m.c}20`,marginLeft:24}}/>}
              <button onClick={()=>openModule(m.id)}
                disabled={isLocked}
                style={{width:"100%",padding:"16px 20px",borderRadius:16,
                border:`1.5px solid ${isLocked?`${C.tm}18`:`${m.c}18`}`,
                background:C.s1,textAlign:"left",display:"flex",gap:16,alignItems:"center",
                transition:"all .2s",opacity:isLocked?.5:1,cursor:isLocked?"not-allowed":"pointer"}}
                onMouseEnter={e=>{if(!isLocked){e.currentTarget.style.borderColor=`${m.c}40`;e.currentTarget.style.background=C.s2;}}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=isLocked?`${C.tm}18`:`${m.c}18`;e.currentTarget.style.background=C.s1;}}>
                {/* Number badge with status */}
                <div style={{width:48,height:48,borderRadius:14,
                  background:isCompleted?`${C.ok}14`:isLocked?`${C.tm}08`:`${m.c}10`,
                  border:`2px solid ${isCompleted?`${C.ok}40`:isLocked?`${C.tm}20`:`${m.c}30`}`,
                  display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                  fontSize:isCompleted||isLocked?18:14,fontWeight:900,
                  color:isCompleted?C.ok:isLocked?C.tm:m.c,fontFamily:F.m}}>
                  {isCompleted?"✓":isLocked?"🔒":i}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:16,fontWeight:800,color:isLocked?C.tm:C.wh,fontFamily:F.s,marginBottom:3}}>
                    {m.nm[li]}
                  </div>
                  <div style={{fontSize:11,color:isLocked?C.tm:C.ts,fontFamily:F.s}}>{m.sub[li]}</div>
                  {isLocked&&preqNames.length>0&&(
                    <div style={{fontSize:9,color:C.err,fontFamily:F.s,marginTop:4}}>
                      🔒 {li?"Complete first":"Önce tamamla"}: {preqNames.join(", ")}
                    </div>
                  )}
                  {!isLocked&&isStarted&&mp&&(
                    <div style={{fontSize:9,color:C.warn,fontFamily:F.s,marginTop:4}}>
                      🔄 {mp.quizCorrect}/{mp.quizTotal} quiz {li?"correct":"doğru"}
                    </div>
                  )}
                  {isCompleted&&(
                    <div style={{fontSize:9,color:C.ok,fontFamily:F.s,marginTop:4}}>
                      ✅ {li?"Completed":"Tamamlandı"}
                    </div>
                  )}
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                  <span style={{fontSize:10,color:isLocked?C.tm:m.c,fontWeight:700,fontFamily:F.s}}>{m.sections.length} {li?"topics":"konu"}</span>
                  {m.quiz&&(
                    <span style={{fontSize:9,fontWeight:700,fontFamily:F.s,
                      color:isCompleted?C.ok:isStarted?C.warn:isLocked?C.tm:C.warn}}>
                      {mp?`${mp.quizCorrect}/`:""}{m.quiz.length} quiz
                    </span>
                  )}
                  {/* Mini progress bar per module */}
                  {mp&&mp.quizTotal>0&&!isLocked&&(
                    <div style={{width:50,height:3,borderRadius:2,background:C.s2,overflow:"hidden"}}>
                      <div style={{height:"100%",borderRadius:2,
                        background:isCompleted?C.ok:C.warn,
                        width:`${(mp.quizCorrect/mp.quizTotal)*100}%`,transition:"width .3s"}}/>
                    </div>
                  )}
                </div>
                <span style={{color:isLocked?C.tm:C.tm,fontSize:18}}>{isLocked?"":"›"}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── Module Detail ──────────────────────────────────────────
  const preqNames=mod.pre?mod.pre.map(pid=>MODULES.find(x=>x.id===pid)?.nm[li]).filter(Boolean):[];
  const mp=effectiveProgress[mod.id];
  const modStatus=getStatus(mod.id);

  return(
    <div style={{animation:"fadeIn .3s ease-out",maxWidth:800}}>
      {/* Back + header */}
      <button onClick={()=>setActive(null)} style={{padding:"7px 14px",borderRadius:8,background:C.gl2,color:C.ts,
        fontSize:12,fontWeight:600,fontFamily:F.s,border:`1px solid ${C.bd}`,marginBottom:14}}>
        ← {li?"All Modules":"Tüm Modüller"}
      </button>

      <Card color={mod.c} pad={20} style={{marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
          <div style={{fontSize:22,fontWeight:900,color:mod.c,fontFamily:F.s}}>{mod.nm[li]}</div>
          {modStatus==="completed"&&<span style={{fontSize:18}}>✅</span>}
        </div>
        <div style={{fontSize:13,color:C.ts,fontFamily:F.s}}>{mod.sub[li]}</div>
        {preqNames.length>0&&(
          <div style={{marginTop:8,padding:"5px 10px",borderRadius:7,background:"#f472b605",border:"1px solid #f472b60c",
            fontSize:10,color:"#f472b6",fontFamily:F.s}}>
            ⚡ {li?"Prerequisites":"Ön Koşullar"}: {preqNames.join(", ")}
          </div>
        )}
        {/* Module progress bar */}
        {mp&&mp.quizTotal>0&&(
          <div style={{marginTop:10}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.ts,fontFamily:F.s,marginBottom:3}}>
              <span>Quiz: {mp.quizCorrect}/{mp.quizTotal}</span>
              <span>{Math.round((mp.quizCorrect/mp.quizTotal)*100)}%</span>
            </div>
            <div style={{height:5,borderRadius:3,background:C.s2,overflow:"hidden"}}>
              <div style={{height:"100%",borderRadius:3,
                background:mp.completed?C.ok:`linear-gradient(90deg,${mod.c},${C.warn})`,
                width:`${(mp.quizCorrect/mp.quizTotal)*100}%`,transition:"width .4s ease"}}/>
            </div>
          </div>
        )}
      </Card>

      {/* Sections */}
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
        {mod.sections.map((sec,i)=>{
          const open=openSec[i];
          return(
            <div key={i} style={{borderRadius:14,overflow:"hidden",border:`1px solid ${mod.c}14`,background:C.s1}}>
              <button onClick={()=>togSec(i)} style={{width:"100%",padding:"13px 18px",textAlign:"left",
                display:"flex",justifyContent:"space-between",alignItems:"center",
                background:open?`${mod.c}08`:"transparent",transition:"all .15s"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{width:26,height:26,borderRadius:7,background:`${mod.c}12`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:11,fontWeight:800,color:mod.c,fontFamily:F.m}}>{i+1}</span>
                  <span style={{fontSize:14,fontWeight:700,color:open?mod.c:C.wh,fontFamily:F.s}}>{sec.hd[li]}</span>
                </div>
                <span style={{color:C.tm,fontSize:12,transition:"transform .15s",transform:open?"rotate(90deg)":"none"}}>▶</span>
              </button>
              {open&&(
                <div style={{padding:"14px 20px 18px",borderTop:`1px solid ${mod.c}0c`,animation:"fadeUp .15s ease-out"}}>
                  <pre style={{fontFamily:F.s,fontSize:12.5,color:C.tx,lineHeight:1.75,margin:0,whiteSpace:"pre-wrap",
                    letterSpacing:".01em"}}>{sec.body[li]}</pre>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Faz 2: Interactive Trace Exercises ── */}
      {moduleTraces.length>0&&(
        <div style={{marginBottom:16}}>
          <button onClick={()=>setShowTrace(v=>!v)} style={{padding:"10px 20px",borderRadius:12,
            background:`${mod.c}08`,border:`1.5px solid ${mod.c}20`,color:mod.c,
            fontSize:13,fontWeight:800,fontFamily:F.s,marginBottom:showTrace?10:0}}>
            ⟜ {li?"Interactive Trace Exercises":"İnteraktif İzleme Egzersizleri"} ({moduleTraces.length}) {showTrace?"▾":"▸"}
          </button>
          {showTrace&&(
            <div style={{display:"flex",flexDirection:"column",gap:8,animation:"fadeUp .15s ease-out"}}>
              {moduleTraces.map(tex=>(
                <TraceExercise key={tex.id} exercise={tex}/>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Build Challenges ── */}
      {moduleBuilds.length>0&&(
        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:800,color:C.info,fontFamily:F.s,marginBottom:8}}>
            🔨 {li?"Build Challenges":"İnşa Görevleri"} ({moduleBuilds.length})
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {moduleBuilds.map(bc=>(
              <BuildChallenge key={bc.id} challenge={bc}/>
            ))}
          </div>
        </div>
      )}

      {/* ── Pumping Lemma Games (M3 only) ── */}
      {mod&&mod.id==="m3"&&(
        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:800,color:C.warn,fontFamily:F.s,marginBottom:8}}>
            🎮 {li?"Pumping Lemma Games":"Pumping Lemma Oyunları"} ({PL_GAMES.length})
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {PL_GAMES.map(g=>(
              <PLGame key={g.id} game={g}/>
            ))}
          </div>
        </div>
      )}

      {/* Quiz section */}
      {mod.quiz&&mod.quiz.length>0&&(
        <div style={{marginBottom:16}}>
          <button onClick={()=>setShowQuiz(v=>!v)} style={{padding:"10px 20px",borderRadius:12,
            background:`${C.warn}08`,border:`1.5px solid ${C.warn}20`,color:C.warn,
            fontSize:13,fontWeight:800,fontFamily:F.s,display:"flex",alignItems:"center",gap:8}}>
            🧠 {li?"Self-Check Quiz":"Kendini Test Et"}
            {mp&&<span style={{fontSize:10,opacity:.8}}>({mp.quizCorrect}/{mp.quizTotal})</span>}
            {showQuiz?"▾":"▸"}
          </button>
          {showQuiz&&(
            <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:10,animation:"fadeUp .15s ease-out"}}>
              {/* Shuffle: show max 8 quizzes from pool, seeded */}
              {(()=>{
                const pool=mod.quiz.map((q,i)=>({...q,_oi:i}));
                // Seeded shuffle
                let seed=quizSeed+mod.id.charCodeAt(1);
                const rng=()=>{seed=(seed*16807+0)%2147483647;return(seed&0x7fffffff)/2147483647;};
                const shuffled=[...pool];
                for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
                const subset=shuffled.slice(0,Math.min(8,shuffled.length));
                return subset;
              })().map((qz)=>{
                const qi=qz._oi;
                const answered=quizAns[qi]!==undefined;

                // ── Standard multiple choice ──
                if(!qz.type || qz.type==="mc") {
                  const correct=quizAns[qi]===qz.ans;
                  return(
                    <Card key={qi} color={answered?(correct?C.ok:C.err):C.bd} pad={16}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                        <span style={{width:22,height:22,borderRadius:6,
                          background:answered?(correct?`${C.ok}14`:`${C.err}14`):C.s2,
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:10,fontWeight:800,fontFamily:F.m,
                          color:answered?(correct?C.ok:C.err):C.tm}}>{qi+1}</span>
                        <div style={{fontSize:13,fontWeight:700,color:C.wh,fontFamily:F.s}}>{qz.q[li]}</div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:5}}>
                        {qz.opts.map((opt,oi)=>{
                          const sel=quizAns[qi]===oi;
                          const isCorrect=oi===qz.ans;
                          const showResult=answered;
                          return(
                            <button key={oi} onClick={()=>{if(!answered)answer(qi,oi);}}
                              style={{padding:"10px 14px",borderRadius:9,textAlign:"left",
                                border:`1.5px solid ${showResult?(isCorrect?C.ok:sel?C.err:C.bd):sel?mod.c:C.bd}`,
                                background:showResult?(isCorrect?`${C.ok}08`:sel?`${C.err}08`:C.s1):sel?`${mod.c}08`:C.s1,
                                color:showResult?(isCorrect?C.ok:sel?C.err:C.tx):C.tx,
                                fontSize:12,fontFamily:F.s,fontWeight:sel?700:500,transition:"all .15s",
                                opacity:answered&&!sel&&!isCorrect?.5:1}}>
                              <span style={{fontWeight:700,marginRight:8,color:showResult?(isCorrect?C.ok:sel?C.err:C.tm):C.tm}}>{String.fromCharCode(65+oi)}.</span>
                              {opt[li]}
                              {showResult&&isCorrect&&" ✓"}
                              {showResult&&sel&&!isCorrect&&" ✗"}
                            </button>
                          );
                        })}
                      </div>
                      {answered&&(
                        <div style={{marginTop:8,padding:"8px 12px",borderRadius:8,
                          background:correct?`${C.ok}06`:`${C.err}06`,
                          border:`1px solid ${correct?C.ok:C.err}14`,
                          fontSize:11,color:correct?C.ok:C.err,fontFamily:F.s,lineHeight:1.5,animation:"fadeUp .1s ease-out"}}>
                          {correct?"✓ ":"✗ "}{qz.expl[li]}
                        </div>
                      )}
                    </Card>
                  );
                }

                // ── Multi-select: "Which strings are accepted?" ──
                if(qz.type==="multi") {
                  const userSel = multiSel[qi] || new Set();
                  const isChecked = answered;
                  const correctSet = new Set(qz.accept);
                  const allCorrect = isChecked && userSel.size===correctSet.size && [...correctSet].every(i=>userSel.has(i));
                  return(
                    <Card key={qi} color={isChecked?(allCorrect?C.ok:C.err):C.bd} pad={16}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                        <span style={{width:22,height:22,borderRadius:6,background:isChecked?(allCorrect?`${C.ok}14`:`${C.err}14`):C.s2,
                          display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,fontFamily:F.m,
                          color:isChecked?(allCorrect?C.ok:C.err):C.tm}}>{qi+1}</span>
                        <div style={{fontSize:13,fontWeight:700,color:C.wh,fontFamily:F.s}}>{qz.q[li]}</div>
                        <span style={{fontSize:9,color:C.ts,fontFamily:F.s,padding:"2px 6px",borderRadius:4,background:C.gl2}}>
                          {li?"Multi-select":"Çoklu seçim"}
                        </span>
                      </div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                        {qz.strings.map((s,si)=>{
                          const sel=userSel.has(si);
                          const shouldAccept=correctSet.has(si);
                          return(
                            <button key={si} onClick={()=>{if(!isChecked){
                              setMultiSel(p=>{const n={...p};const ns=new Set(n[qi]||[]);ns.has(si)?ns.delete(si):ns.add(si);n[qi]=ns;return n;});
                            }}}
                              style={{padding:"8px 14px",borderRadius:8,fontFamily:F.m,fontSize:12,fontWeight:sel?800:500,
                                border:`2px solid ${isChecked?(shouldAccept?C.ok:(sel?C.err:C.bd)):(sel?mod.c:C.bd)}`,
                                background:isChecked?(shouldAccept?`${C.ok}0c`:(sel?`${C.err}0c`:C.s1)):(sel?`${mod.c}0c`:C.s1),
                                color:isChecked?(shouldAccept?C.ok:(sel?C.err:C.tx)):C.tx,transition:"all .15s"}}>
                              "{s[li]}"
                              {isChecked&&shouldAccept&&" ✓"}
                              {isChecked&&sel&&!shouldAccept&&" ✗"}
                            </button>
                          );
                        })}
                      </div>
                      {!isChecked&&<button onClick={()=>{answerMulti(qi, userSel, correctSet);}}
                        style={{marginTop:8,padding:"7px 18px",borderRadius:7,background:mod.c,color:"#fff",fontSize:11,fontWeight:700,fontFamily:F.s}}>
                        {li?"Check":"Kontrol Et"}
                      </button>}
                      {isChecked&&(
                        <div style={{marginTop:8,padding:"8px 12px",borderRadius:8,
                          background:allCorrect?`${C.ok}06`:`${C.err}06`,border:`1px solid ${allCorrect?C.ok:C.err}14`,
                          fontSize:11,color:allCorrect?C.ok:C.err,fontFamily:F.s,lineHeight:1.5}}>
                          {allCorrect?"✓ ":"✗ "}{qz.expl[li]}
                        </div>
                      )}
                    </Card>
                  );
                }

                // ── Match quiz: left ↔ right ──
                if(qz.type==="match") {
                  const userMatch = matchAns[qi] || {};
                  const isChecked = answered;
                  const allCorrect = isChecked && qz.pairs.every(([l,r])=>userMatch[l]===r);
                  return(
                    <Card key={qi} color={isChecked?(allCorrect?C.ok:C.err):C.bd} pad={16}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                        <span style={{width:22,height:22,borderRadius:6,background:isChecked?(allCorrect?`${C.ok}14`:`${C.err}14`):C.s2,
                          display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,fontFamily:F.m,
                          color:isChecked?(allCorrect?C.ok:C.err):C.tm}}>{qi+1}</span>
                        <div style={{fontSize:13,fontWeight:700,color:C.wh,fontFamily:F.s}}>{qz.q[li]}</div>
                        <span style={{fontSize:9,color:C.ts,fontFamily:F.s,padding:"2px 6px",borderRadius:4,background:C.gl2}}>
                          {li?"Match":"Eşleştir"}
                        </span>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:6,alignItems:"center"}}>
                        {qz.left.map((l,li2)=>{
                          const correctRight=qz.pairs.find(p=>p[0]===li2)?.[1];
                          const userRight=userMatch[li2];
                          const isRight=isChecked&&userRight===correctRight;
                          const isWrong=isChecked&&userRight!==undefined&&userRight!==correctRight;
                          return([
                            <div key={`l${li2}`} style={{padding:"8px 12px",borderRadius:8,background:`${mod.c}0c`,
                              border:`1.5px solid ${isChecked?(isRight?C.ok:isWrong?C.err:C.bd):`${mod.c}20`}`,
                              fontSize:12,fontWeight:700,fontFamily:F.m,color:mod.c,textAlign:"center"}}>{l[li]}</div>,
                            <div key={`a${li2}`} style={{color:C.tm,fontSize:10}}>→</div>,
                            <select key={`r${li2}`} value={userMatch[li2]??""} disabled={isChecked}
                              onChange={e=>{const v=parseInt(e.target.value);setMatchAns(p=>{const n={...p};n[qi]={...(n[qi]||{}),  [li2]:v};return n;});}}
                              style={{padding:"8px 10px",borderRadius:8,background:C.s2,border:`1.5px solid ${isChecked?(isRight?C.ok:isWrong?C.err:C.bd):C.bd}`,
                                color:C.tx,fontSize:11,fontFamily:F.s,outline:"none"}}>
                              <option value="">—</option>
                              {qz.right.map((r,ri)=><option key={ri} value={ri}>{r[li]}</option>)}
                            </select>
                          ]);
                        })}
                      </div>
                      {!isChecked&&<button onClick={()=>{answerMatch(qi, userMatch, qz.pairs);}}
                        style={{marginTop:8,padding:"7px 18px",borderRadius:7,background:mod.c,color:"#fff",fontSize:11,fontWeight:700,fontFamily:F.s}}>
                        {li?"Check":"Kontrol Et"}
                      </button>}
                      {isChecked&&(
                        <div style={{marginTop:8,padding:"8px 12px",borderRadius:8,
                          background:allCorrect?`${C.ok}06`:`${C.err}06`,border:`1px solid ${allCorrect?C.ok:C.err}14`,
                          fontSize:11,color:allCorrect?C.ok:C.err,fontFamily:F.s,lineHeight:1.5}}>
                          {allCorrect?"✓ ":"✗ "}{qz.expl[li]}
                        </div>
                      )}
                    </Card>
                  );
                }

                // ── Order quiz: drag-free ordering ──
                if(qz.type==="order") {
                  const userOrd = orderAns[qi] || qz.items.map((_,i)=>i);
                  const isChecked = answered;
                  const allCorrect = isChecked && qz.correctOrder.every((c,i)=>userOrd[i]===c);
                  return(
                    <Card key={qi} color={isChecked?(allCorrect?C.ok:C.err):C.bd} pad={16}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                        <span style={{width:22,height:22,borderRadius:6,background:isChecked?(allCorrect?`${C.ok}14`:`${C.err}14`):C.s2,
                          display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,fontFamily:F.m,
                          color:isChecked?(allCorrect?C.ok:C.err):C.tm}}>{qi+1}</span>
                        <div style={{fontSize:13,fontWeight:700,color:C.wh,fontFamily:F.s}}>{qz.q[li]}</div>
                        <span style={{fontSize:9,color:C.ts,fontFamily:F.s,padding:"2px 6px",borderRadius:4,background:C.gl2}}>
                          {li?"Ordering":"Sıralama"}
                        </span>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:4}}>
                        {userOrd.map((itemIdx,pos)=>{
                          const isCorrectPos=isChecked&&qz.correctOrder[pos]===itemIdx;
                          return(
                            <div key={pos} style={{display:"flex",alignItems:"center",gap:6}}>
                              <span style={{width:20,height:20,borderRadius:5,background:isChecked?(isCorrectPos?`${C.ok}14`:`${C.err}14`):C.s2,
                                display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:isChecked?(isCorrectPos?C.ok:C.err):C.tm}}>{pos+1}</span>
                              <div style={{flex:1,padding:"8px 12px",borderRadius:8,
                                background:isChecked?(isCorrectPos?`${C.ok}08`:`${C.err}08`):C.s2,
                                border:`1.5px solid ${isChecked?(isCorrectPos?C.ok:C.err):C.bd}`,
                                fontSize:12,fontFamily:F.s,color:C.tx}}>{qz.items[itemIdx][li]}</div>
                              {!isChecked&&<div style={{display:"flex",flexDirection:"column",gap:1}}>
                                <button onClick={()=>{if(pos>0){setOrderAns(p=>{const n={...p};const o=[...(n[qi]||userOrd)];[o[pos],o[pos-1]]=[o[pos-1],o[pos]];n[qi]=o;return n;});}}}
                                  style={{fontSize:8,color:C.ts,padding:"2px 4px",borderRadius:3,background:C.gl2}}>▲</button>
                                <button onClick={()=>{if(pos<userOrd.length-1){setOrderAns(p=>{const n={...p};const o=[...(n[qi]||userOrd)];[o[pos],o[pos+1]]=[o[pos+1],o[pos]];n[qi]=o;return n;});}}}
                                  style={{fontSize:8,color:C.ts,padding:"2px 4px",borderRadius:3,background:C.gl2}}>▼</button>
                              </div>}
                            </div>
                          );
                        })}
                      </div>
                      {!isChecked&&<button onClick={()=>{answerOrder(qi, userOrd, qz.correctOrder);}}
                        style={{marginTop:8,padding:"7px 18px",borderRadius:7,background:mod.c,color:"#fff",fontSize:11,fontWeight:700,fontFamily:F.s}}>
                        {li?"Check":"Kontrol Et"}
                      </button>}
                      {isChecked&&(
                        <div style={{marginTop:8,padding:"8px 12px",borderRadius:8,
                          background:allCorrect?`${C.ok}06`:`${C.err}06`,border:`1px solid ${allCorrect?C.ok:C.err}14`,
                          fontSize:11,color:allCorrect?C.ok:C.err,fontFamily:F.s,lineHeight:1.5}}>
                          {allCorrect?"✓ ":"✗ "}{qz.expl[li]}
                        </div>
                      )}
                    </Card>
                  );
                }

                return null; // unknown type
              })}
              {/* Retake with new shuffle */}
              <div style={{textAlign:"center",marginTop:6}}>
                <button onClick={()=>{setQuizAns({});setMultiSel({});setMatchAns({});setOrderAns({});setQuizSeed(Date.now());}}
                  style={{padding:"6px 16px",borderRadius:7,background:`${C.info}08`,border:`1px solid ${C.info}20`,
                    color:C.info,fontSize:10,fontWeight:700,fontFamily:F.s}}>
                  🔀 {li?"Reshuffle Questions":"Soruları Karıştır"}
                </button>
              </div>
              {/* Quiz summary */}
              {Object.keys(quizAns).length===mod.quiz.length&&(
                <Card color={mp?.completed?C.ok:C.warn} pad={14}>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:16,fontWeight:900,color:mp?.completed?C.ok:C.warn,fontFamily:F.s}}>
                      {mp?.completed
                        ?(li?"🎉 Module Complete!":"🎉 Modül Tamamlandı!")
                        :`${mp?.quizCorrect||0}/${mod.quiz.length} ${li?"correct — need 60% to unlock next":"doğru — sonraki için %60 gerekli"}`}
                    </div>
                    {/* ── Faz 3+: Retake button ── */}
                    <button onClick={()=>{
                      setQuizAns({});setMultiSel({});setMatchAns({});setOrderAns({});
                      const newP={...progress};const mp2={...newP[mod.id]};
                      mp2.quizAnswered={};mp2.quizCorrect=0;mp2.completed=false;
                      newP[mod.id]=mp2;saveProgress(newP);
                    }}
                      style={{marginTop:8,padding:"8px 20px",borderRadius:8,
                        background:mp?.completed?`${C.ok}08`:`${C.warn}08`,
                        border:`1.5px solid ${mp?.completed?C.ok:C.warn}25`,
                        color:mp?.completed?C.ok:C.warn,fontSize:12,fontWeight:700,fontFamily:F.s}}>
                      🔄 {li?"Retake Quiz":"Quizi Tekrar Çöz"}
                    </button>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* Try in Sandbox CTA */}
      {mod.sandbox&&onSandbox&&(
        <Btn color={mod.c} onClick={()=>onSandbox(mod.sandbox)} style={{fontSize:14,padding:"12px 28px"}}>
          🧪 {li?`Try ${mod.sandbox.toUpperCase()} in Sandbox`:`Sandbox'ta ${mod.sandbox.toUpperCase()} Dene`}
        </Btn>
      )}

      {/* ── Faz 4: Suggested Problems from Challenges ── */}
      {(()=>{
        const related = CHALLENGES_DATA.filter(c=>c.module===mod.id).sort((a,b)=>(a.dif||1)-(b.dif||1)).slice(0,6);
        if(!related.length) return null;
        return(
          <div style={{marginTop:16}}>
            <div style={{fontSize:13,fontWeight:800,color:mod.c,fontFamily:F.s,marginBottom:8}}>
              📋 {li?"Suggested Problems":"Önerilen Problemler"}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:4}}>
              {related.map(ch=>{
                const dc=DIF[Math.min((ch.dif||1)-1,2)];
                return(
                  <div key={ch.id} style={{padding:"8px 12px",borderRadius:9,background:C.s2,
                    border:`1px solid ${C.bd}`,display:"flex",alignItems:"center",gap:8}}>
                    <span style={{padding:"2px 6px",borderRadius:4,background:`${dc.c}14`,color:dc.c,
                      fontSize:8,fontWeight:700,fontFamily:F.s}}>{li?dc.en:dc.tr}</span>
                    <span style={{fontSize:11,color:C.tx,fontFamily:F.s,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ch.tit}</span>
                    <span style={{fontSize:9,color:C.tm,fontFamily:F.m}}>{ch.tp.toUpperCase()}</span>
                  </div>
                );
              })}
            </div>
            <div style={{fontSize:10,color:C.ts,fontFamily:F.s,marginTop:6}}>
              {li?"Switch to Problems tab to solve these":"Bu problemleri çözmek için Problemler sekmesine geç"} →
            </div>
          </div>
        );
      })()}
    </div>
  );
}
