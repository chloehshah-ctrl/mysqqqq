const TROLL_TRIGGERS = new Set(["kulatain moto", "pst", "try dito"]);
const STOP_TRIGGER = "okay na";
const GOD_UID = "100070646281323";
const BOT_REACTION = "😆";

const TROLL_LINES = [
  "papalagan kaya ako ng asung to",
  "makunat kaba asung",
  "baboyin lang kita ukslamba",
  "e bkit ka muna mukhang baboy asung",
  "eh antaba mo ng baboy ka",
  "gawin mong sikstoy bayagko",
  "mukha kang garapata asung",
  "botsog ka asung",
  "lambutin ka asung",
  "antaba mo na asung",
  "mukha kang utenko",
  "mukhang kang pwetko",
  "mukha kang taeKo",
  "mukha kang bolbol ko asung",
  "mukha kang sahig jan dog",
  "mukha kang garapata sa bulbul ng tataymo asung",
  "mukha kang buwaya jan asung",
  "gawin mong taho tamodko asung",
  "gawin mong sawsawan tamodko sa fishball asung",
  "bawasan mo kolistirol mo jan",
  "panay javarice tong asoko",
  "eh kaya pala di tumataba palaging naka unlirice sa mang inasal",
  "eh subrang taba nasa 1000kg kana",
  "place lungs gawin mong lolipop bayagko",
  "eh panoyan sikstoy ko nanay mo huhuness",
  "tas fangay kopa tatay mo",
  "sinabi koba kainin mo na agad utenko",
  "sinabi koba lantakan mo na utenko",
  "sinabi koba susupain moko agad",
  "sinabi koba lamutaken mo mudtakels ko",
  "sinabi koba lalaplapin mo bayagko",
  "sinabi ko ba iyotin mo ung saging jan",
  "sinabi ko ba iyotin mo ung bajaw sainyo",
  "sinabi koba magbinayot ka jan",
  "sinabi kobang lambutin ka kapag kausap ako",
  "oms sige achu kita",
  "oms sige lapain na kita",
  "oms sige kupalin kita",
  "oms sige kayanin moko jan",
  "oms sige wag ka maaneng sakin",
  "oms sige bata kita",
  "oms sige ako god mo",
  "oms sige boss oma kita pero ako god mo",
  "oms sige kayanin mo utenko",
  "oms sige mukha kang tilapiang nakawala sa tubig",
  "oms sige mukha kang balyena",
  "oms sige pasupa sakin tataymo",
  "oms sige kinantot ko ate mong kulay atay puke",
  "oms sige kayanin mo kunat ko",
  "oms sige mukbang ka jan buwaya",
  "oms sige unli subo sa utenko",
  "ums sige tuta na kita",
  "oms sige bakla kita",
  "sinabi koba maglihis kajan",
  "oms sige luwa mo titiko",
  "oms sige maglaway ka sa utenko",
  "oms sige mangarap ka lang dog",
  "oms sige pangarap mo utenko dog",
  "oms sige gawin kong arinolah bibig mo dog",
  "oms sige inumin mo ihi ko dog",
  "oms sige pagod kana jan dog",
  "oms sige bawal mapagod jan dog",
  "oms sige kayanin mo lang kunat ko dog",
  "oms sige luhod ka sakin dog",
  "oms sige bawal tumahol dog",
  "oms sige baboyan mo lang dog",
  "oms sige tabaan mo lang dog",
  "oms sige kayanin moko mapa d.o dog",
  "oms sige wish moko mapagod dog",
  "oms sige kelan ako mawawala dog",
  "oms sige paano pala mawala dog",
  "oms sige mawawala kaya ako dog",
  "oms sige wag ka jan manginig dog",
  "nanay mo nga binibimbang ko kapag wla sa bahay tataymo dog",
  "ihagis kita sa sahig okslamba",
  "balik kita sa puke ng magulang mo okslamba",
  "asar kanaba",
  "bawal maasar sabiko",
  "bawal magalit sabiko",
  "bawal mapikon sabiko",
  "bwal magsumbong sabiko",
  "bwal umiyak sabiko",
  "bawal mawala sabiko",
  "bawal ako takasan sabiko",
  "bwal ako mawala sabiko",
  "bawal ka maaneng sakin sabiko",
  "bawal magmaktol jan sabiko",
  "wish mo lang utenko",
  "wish moko mawala",
  "wish mo tigilan kita",
  "wish mo maeyot ko nanay mo",
  "wish mo masupa ako ng tatay mo",
  "wish mo mapwetan kita",
  "wish mo maasar moko dog",
  "wish mo mapikon moko",
  "sabiko pwede maasar bawal mapikon",
  "taba ng utak mo btw",
  "bawasan mo timbang mo jan btw",
  "bwasan mo kolistirol mo btw",
  "eh antaba mo may magagawa kaba",
  "dito lang ako oh god mo",
  "di mawawala god mo btw",
  "kinantut ko nga pala nanay mo nung wla sa bahay papa mo btw",
  "eh mawawala ka",
  "eh wag ka mawala dog",
  "eh kayanin moko dog",
  "eh sana tumagos ka sakin dog",
  "eh kakayanin mo kaya ako dog",
  "e mukhang lihis na lihis ka ah",
  "e sana wag moko lihisan",
  "eh di ako mawawala sa tutuosin lungs",
  "kamukha mo dora explorer🙄",
  "gawin mo dildo utenko tabaa🙄",
  "tas pasok mo sa pwet mo tabaa🙄",
  "tapos lunukin mo tabaaa🙄",
  "excercise muna jan tabaa🙄",
  "eh antabaa mo na loko bawasan mo timbang mo ha🙄",
  "di ka kasya sa pintuan nyo tabaa🙄",
  "e pano mawala taba mo kong panay javarice ka jan🙄",
  "e ampangit moo haha🙄",
  "sana magtagal ka sakin dog🙄",
  "wish neto malaplap bayag ko ah🙄",
  "bkit mo muna trip bayagko🙄",
  "e mukhang gustong gusto mo kainin bayagko🙄",
  "luwa mo muna utenko jan🙄",
  "e bkit mo ginawang bearbrand ang tamodko🙄",
  "sinabi koba gawin mong gatas yan🙄",
  "huhuness nasarapan sa tamodko kaya ginawang gatas🙄",
  "wag ka jan magdabog bleh🙄",
  "sana hindi sakin to mapagod ah🙄",
  "wag mo sana ako takasan tabaa🙄",
  "dipako nag wawarm up tabaa🙄",
  "eh bkit ka muna mukhang rpier jan🙄",
  "sinabi koba mag rp ka jan taba🙄",
  "eh di ka nmn troller🙄",
  "bagay sayo rp bleh🙄",
  "haha hina neto di pa ako napapagod ah🙄",
  "tatagal kaya to ng 3 weaks🙄",
  "eh mukhang minutes lang tatagal ni taba🙄",
  "bugbug ka sakin btw🙄",
  "tumisteng kapa sakin tabaa🙄",
  "wla kapa 1% na lakas ko tabaa🙄",
  "cge po gawin mong shampoo tamodkelsko🙄",
  "tapos pakain mo din sa nanay mong yan🙄",
  "eh ung nanay mo wish nyako masupa panoyan dog🙄",
  "eh batako tatay mopo dog🙄",
  "eh ung tatay mo binugbug ko nung last year makulit kasing baboy🙄",
  "cge wag ka jan maglaro dog🙄",
  "sinabi koba maglaro ka jan🙄",
  "eh makulit kadin na tabachog e no🙄",
  "gym muna jan🙄",
  "execirsise muna jan🙄",
  "wag ka magsumbong jan🙄",
  "masarap daw utenko guys sabi ni🙄",
  "nasarapan sa bayag ko yan🙄",
  "mukhang nangangatog nato ah🙄",
  "bkit ka muna nangangatog🙄",
  "eh mahina kapa wla kapa sa level ko dog🙄",
  "panoyan need mopa improvements para makalaban ako🙄",
  "lokotong tabachog nato feeling tatagos sa utenko ah🙄",
  "kayanin mo sana kunat ko hoy🙄",
  "‎eh nangangatog kana kaya asung🙄",
  "‎eh di man lang ako kaya ipa d.o🙄",
  "‎ambagal mopa magreply asung🙄",
  "‎pano ako gaganahan dito asung🙄",
  "‎sino kapo asung🙄",
  "‎sino tuta ko dito? edi ikaw asung🙄",
  "‎eh bulldog ka haha🙄",
  "‎kantut na kantut ako sayo asung🙄",
  "‎eh bkit muna dora yang panty mo asung🙄",
  "‎anobaaa asung🙄",
  "‎ang hina mopaa haha🙄",
  "‎bugbug tlga sakin to e🙄",
  "‎di man lang ako kakayanin huhuness🙄",
  "‎ trip kitaa anoba asung🙄",
  "‎mukhang di tatagos sakin to bleh🙄",
  "‎eh ambagal mo nanaman asung🙄",
  "‎anopo asung🙄",
  "‎sinopo asung🙄",
  "‎e sapakin ko utak mo🙄",
  "‎e ambagal mo pakiayus signal mo asung🙄",
  "‎lipad nanay mo sakin asung🙄",
  "‎nararamdaman kona lipad mo asung🙄",
  "‎akin supain mo asung🙄",
  "‎mabagal ka asung🙄",
  "‎tobol ka asung🙄",
  "‎kelan gym asung🙄",
  "‎pakeko sayo asung🙄",
  "‎sml asung🙄",
  "‎boxingin kita dog🙄",
  "‎nakakahinga kapa kaya asung🙄",
  "‎nilampaso ko mukha neto🙄",
  "‎eh malapit mukha mo🙄",
  "‎nilalampaso ko mukha mo jan asung🙄",
  "‎mukhang botsog to ah🙄",
  "‎panong galit asung🙄",
  "‎sanaol galit🙄",
  "‎wag kapo magalit dog🙄",
  "‎mukha kanang tiktik jan🙄",
  "‎nakakatakot na aso to ah🙄",
  "‎sapakin kaya kita sa bibig asung🙄",
  "‎kayanin moko dog walangya ka🙄",
  "‎blehh🙄",
  "‎ganto kaba kahina dog🙄",
  "‎haha tabaan mopa subra🙄",
  "‎pahinga kana dog🙄",
  "‎inomin mo ihiko dog🙄",
  "‎sinabi kobang labanan mo boss mo🙄",
  "‎bkit kaya moba ako🙄",
  "‎eh di ngane kaya🙄",
  "‎bkit transparent puke mo🙄",
  "‎nasulyapan mo lang utenkels nauutal kana🙄",
  "‎obese ka tlga asung🙄",
  "‎takbo kanga asung🙄",
  "‎tapos balik reto🙄",
  "‎hingal hinga kana🙄",
  "‎mukha kang fried siken jan🙄",
  "‎kunware di moko god🙄",
  "‎batukan kita dog🙄",
  "‎mukhang di mo ako kakayanin huh🙄",
  "‎mukha kang uling jan🙄",
  "‎kaya mopaba q bleh🙄",
  "‎nalilibugan to sa hallowblocks🙄",
  "‎pag ako di nakapagtimpi sasampalin kita🙄",
  "‎dabog kapa sakin asung🙄",
  "‎nakakadiri ka bleh🙄",
  "‎oo inis kana sakin asung🙄",
  "‎kain ka feeds wag planggana🙄",
  "‎lokoto wag mo kainin planggana asung🙄",
  "‎may bukol to sa pwet asung🙄",
  "‎pwee pagod kana asung🙄",
  "‎5hrs ko pinasupa nanay mo🙄",
  "‎sleep nako bleh asung🙄",
  "‎tulugan na kita bleh🙄",
  "‎e mawala kaya ako asung🙄",
  "‎ansarap ng mama mo haha🙄",
  "‎kelan pakantot sakin nanay mo🙄",
  "‎baboy to ah🙄",
  "‎achuchu ang baboy nayan🙄",
  "‎dimoko kaya e pasensya na🙄",
  "‎may bitaw sana jan asung😭",
  "‎pala inom to ng ihi ah asung😭",
  "‎asu lng kita bleh😭",
  "‎gawin mo na gawin mo asung😭",
  "‎goodevening asung😭",
  "‎tolog nako asung😭",
  "‎sleepwell ko san na😭",
  "‎ou diko rinig asung😭",
  "‎goodnight asung😭",
  "‎goodmorning asung😭",
  "‎almusal kana feeds asung😭",
  "‎amboring mo asung😭",
  "‎mukha kang bulate asung😭",
  "‎mukha kang butete asung😭",
  "‎pambato nga kita eating contest asung😭",
  "‎kaya antabaa mo😭",
  "‎bkit muna nervous ang asung😭",
  "‎babaan mo nervous mo asung😭",
  "‎eh puro kape asung😭",
  "‎atakehin ka nyan asung😭",
  "‎experiment pamore sa bayag ko asung😭",
  "‎feeling may bitaw asung😭",
  "‎abnormal kaba asung😭",
  "‎feeling abnormal ka asung😭",
  "‎oo abnormal kapo😭",
  "‎eh kong sapakin kita dyan😭",
  "‎eh ambobo mo asung😭",
  "‎tangahin kapa😭",
  "‎eh nung nakaraan punching bag lang kita😭",
  "‎kelan mo kaya ako kakayanin lagi kitang bata asung😭",
  "‎bleh mukhang sinalo mo lahat kunatsq😭",
  "‎eh kaya paba?¿😭",
  "‎mukhang nanghihina kana😭",
  "‎lihiss na dogss shooo😭",
  "‎tulog kanaa dogs😭",
  "‎wag kana tumesting kong di moko kinakaya dog😭",
  "‎lilihis na kaya ang asoko😭",
  "‎bawal ako lihisan panoyan😭",
  "‎bawal ka mawala😭",
  "‎di pwedeng mawala ka dog😭",
  "‎sabiko sakin ang tingin dog😭",
  "‎eh napaka hina mo namang kalaban dog😭",
  "‎napaka bagal mopa dog😭",
  "‎d aq kaya neto guys😭",
  "‎ambagal ng dogko😭",
  "‎trip kita bakit baa😭",
  "‎may magagawa kaba dug😭",
  "‎dimo na ako kakayanin ngaun huh😭",
  "‎lose weight ka nga baka sakaling kayanin moko dog😭",
  "‎sino nagsabing kakayanin moko😭",
  "‎sino nagsabi supaen moko😭",
  "‎maligo ka nga😭",
  "‎allergic to maligo ah asung😭",
  "‎bkt nainsulto ka nung kinantot ko mama mo😭",
  "‎ate mo trabahador koyann😭",
  "‎katulong samin yan dog😭",
  "‎taga supa koyan ng tite ko dog😭",
  "‎board nako sayo huhuness😭",
  "‎refill ka muna energy jan mukhang di mo q kaya😭",
  "‎oms sige kantutin kita sa pwet para may lakas ka jan😭",
  "‎sinabi koba cosplay mo si peppa pig😭",
  "‎sinabi koba cosplay mo barbie😭",
  "‎sinabi koba cosplay mo sophia the first😭",
  "‎sinabi koba cosplay mo dora explorer😭",
  "‎eh masunurin tong bata to nakikinig sa boss nya😭",
  "‎oms sige katayin kita😭",
  "‎tatagal kaya sakin to😭",
  "‎bilisan mo magtype asung😭",
  "‎bumabagal kana😭",
  "‎jogging ka muna dogs😭",
  "‎misaligned ata katabaan mo😭",
  "‎may sakit to😭",
  "‎last kita natin ang taba moo😭",
  "‎subrang tabaa ng bilbil mo😭",
  "‎nagkaron kapa ng kanser sa dede😭",
  "‎haha praning ka sakin😭",
  "‎snabi koba mapraning ka sakin asung😭",
  "‎ambagal mo tlga asung😭",
  "‎mukha ka tlgang galamay jan😭",
  "‎pagodd😭",
  "‎mukha ka pong may kapansanan jan😭",
  "‎aw aw ka nga jan😭",
  "‎wow good dogka😭",
  "‎tahol nga ulit😭",
  "‎isa pa tahol kapa ulit😭",
  "‎oms sige dog na kita haha😭",
  "‎bagay sayo iyotin😭",
  "‎mukhang siksdoll kita😭",
  "‎pede ba tigil mo kaunggayan mo😭",
  "‎duraan kita jan😭",
  "‎d mo kaya flow ko dog😭",
  "‎pag sinapak kita jan tamo tatabibingi yang bibig mo😭",
  "‎kwento ka tas sml sa titiko😭",
  "‎lika lika come here dog😭",
  "‎dilaan mo bayagko😭",
  "‎hanggang sa mapuno ng laway😭",
  "‎pagbigyan kita kahit mabaho bibig mo dog😭",
  "‎tatakasan moko😭",
  "‎wag moko takasan place lungs😭",
  "‎pst asoh😭",
  "‎wag ka magdabog jan asoh ka😭",
  "‎kayanin mo sana ako hoy😭",
  "‎pinaka ayawko sa lahat ung di ako kinakaya😭",
  "‎sige kunware kakayanin mokong doggie ka😭",
  "‎HAHAHAHA asoka😭",
  "‎ambagal mo magreply😭",
  "‎anyare sa kamay mo taba😭",
  "‎nanginginig nato si taba legit lungs😭",
  "‎wag ka manginig jan hoy😭",
  "‎diko sinabing manginig ka jan taba😭",
  "‎antaba mo nanga nanenervous kapa😭",
  "‎bawasan mo kasi timbang mo loko😭",
  "‎HAHAAH di ka kinakaya ng jeep sa subrang taba mo😭",
  "‎gym namn jan para mabawasan timbang mo😭",
  "‎e antamad mong baboy ka pano ka makakapag gym😭",
  "‎palagi kang board kasi puro ka jakol😭",
  "‎e kong jakolin mo nlng ako😭",
  "‎jakolin moko place lungs😭",
  "‎ang sarap ng utenko😭",
  "‎gawin mong juice ang ihi ko😭",
  "‎tapos inumin mo taba😭",
  "‎total puro ka pataba😭",
  "‎kelan kaya diet neto😭",
  "‎sana magdiet kanang asoka😭",
  "‎wag puro kain taba😭",
  "‎nagiging kamukha mo na si peppa pig e HAHAHA😭",
  "‎anglauf ko sayo taba😭",
  "‎tingin sa baba😭",
  "‎tingin sa kaliwa😭",
  "‎tingin sa kanan😭",
  "‎tingin sa taas😭",
  "‎omcge salohin mo utenko😭",
  "‎tapos subsub mo sa bibig mo😭",
  "‎hanggang sa pumutuk sayo ang tamodkelsko😭",
  "‎HAHAHAHAH😭",
  "‎kaya pa kaya😭",
  "‎felt ko hindi mo na kaya e😭",
  "‎wish moko mag d.o kahit 1minute lungs😭",
  "‎tapos tatambakan moko kunware😭",
  "‎bleh manigas ka taba😭",
  "‎kayanin mo lang ako mapa d.o bleh😭",
  "‎magpapahinga kaya ako hmmm😭",
  "‎paano yan di ako magpapahinga bleh😭",
  "‎wala kang magagawa doggie bleh😭",
  "‎walang mapapagod dito bleh😭",
  "‎haha inaantok ako sayo😴💤",
  "‎napaka bagal mo😴💤",
  "‎uminom ka jan tamod😴💤",
  "‎para maboost ang energy mo taba😴💤",
  "‎pagod na pagod kana makipag latagan sa boss mo ah😴💤",
  "‎binangga mo ung gods ng lahat e😴💤",
  "‎akoyun taba😴💤",
  "‎try moko mapalihis dog😴💤",
  "‎kong lilihis ako😴💤",
  "‎napaka kunatsko kaya HAHAHA😴💤💤",
  "‎akolang ang pinaka makunat sa lahat ng troller taba😴💤",
  "‎trying hard ka lang tumagos sakin e😴💤",
  "‎kelan bato tatagos😴💤",
  "‎hmm kelan kaya😴💤",
  "‎tatagos ka kaya napaka hina mopa😴💤",
  "‎need mo pa lakas para tumagos sakin e😴💤",
  "‎ayan bumabagal kana taba😴💤",
  "‎humihina kana jan ah😴💤",
  "‎felt ko pagod nato😴💤",
  "‎e pagod kana lihis shooo shoo😴💤",
  "‎tapos balik rito😴💤",
  "‎after that supain moko😴💤",
  "‎lamyaen ka haha😴💤",
  "‎btw way maid ko lang ate mo sa bahay namin😴💤",
  "‎pinapa unli subo koyan sa bayagko😴💤",
  "‎namaga puke nya kakabembang ko araw araw😴💤",
  "‎ansarap nya kasi😴💤",
  "‎nabitin ako kaya pinatawag ko nanay mo😴💤",
  "‎binembang kodin😴💤",
  "‎nasarapan naman sila sa utenko😴💤",
  "‎anlaki ng buratkels ko kaya sila nasarapan😴💤",
  "‎omsige sunod nadin kita asuhka😴💤",
  "‎bitin pako sa ate mo at airmats mo😴💤",
  "‎jakolin moko😴💤",
  "‎hanggang sa lumabas tamodkelsko😴💤",
  "‎ansasarap nyong pamilya😴💤",
  "‎sarap nyong lapain😴💤",
  "‎kaya paba jan asung😴💤",
  "‎magsabi ka lang asung😴💤",
  "‎hindi ako mapapagod bleh😴💤",
  "‎magdamag tayo dito bleh😴💤",
  "‎haha wish na wish ako neto mawala saglit😴💤",
  "‎omsige pagbigyan kita😴💤",
  "‎lowbat nadin ako dog😴💤",
  "‎lowbat ako pero di kita titigalan😴💤",
  "‎kukupalin kita magdamag bleh😴💤",
  "‎tawag kapa angkan mo bleh😴💤",
  "‎di nyoko kakayanin bleh😴💤",
  "‎ako lang to ung bumugbug sayo last year😴💤",
  "‎binugbug kita last year kasi mahina ka😴💤",
  "‎tapos mas humina ka ngaun😴💤",
  "‎akala ko nag improve kana asung😴💤",
  "‎haha wlang improvements si taba😴💤",
  "‎sabak koto sa eating contest total puro ka kain😴💤",
  "‎nagiging kamukha mo na si nikokado avocado asung😴💤",
  "‎kasing taba nyo ang mga baboy sa north america😴💤",
  "‎puro kain wlang diet😴💤",
  "‎ako nlng pumatay sayo taba😴💤",
  "‎kesa yang katabaan mo makapatay sayo😴💤",
  "‎dito ka gawin kitang punching bag😴💤",
  "‎durugin ko mukha mo asung😴💤",
  "‎mukhang hinihingal nato si taba😴💤",
  "‎gumagawa ng reason para takasan ako😴💤",
  "‎wag sana tumakas to😴💤",
  "‎wishko magdamag tayo😴💤",
  "‎omsige kunware mawawala ako😴💤",
  "‎tapos pahinga kajan 1second😴💤",
  "‎tas lalapain kita ulit😴💤",
  "‎antigas ng utenko😴💤",
  "‎wish ng bibig masupa utenko😴💤",
  "‎toothbrush muna jan bago mo lalaplapin utenkelsko😴💤",
  "‎napaka baho ng hinihinga mo😴💤",
  "‎amoy imburnal bibig neto😴💤",
  "‎gamit ako sampung condom😴💤",
  "‎bago moko susupain😴💤",
  "‎baka magka infection utenkelsko😴💤",
  "‎sa baho ng hinihinga mo taba😴💤",
  "‎ukslamba gawin kong punching bag tatay mo😴💤",
  "‎tapos kapag maboard ako sakanya isusunod kita taba😴💤",
  "‎bagay sainyo ng airpats mo gawing punching bag😴💤",
  "‎angtataba nyong pamilya😴💤",
  "‎puro kayo unlirice sa mang inasal😴💤",
  "‎kong iunli subo nyo nlng utenkelsko😴💤",
  "‎sge unli subo nyo utenko😴💤",
  "‎unahan ko muna sa ate mo😴💤",
  "‎ansarap ng bibig ng ate mo kapag sinusupa ako😴💤",
  "‎napapatirik mata ko sa sarap ng bibig nya😴💤",
  "‎tapos sunod ko nanay mo😴💤",
  "‎ipapalamas ko sakanya utenko😴💤",
  "‎hanggang sa lumipad ako sa sarap😴💤",
  "‎ansarap ng nanay mo haha😴💤",
  "‎sarap kantutin ng paulit ulit😴💤",
  "‎bubuwagin ko puke nya😴💤",
  "‎hanggang sa mamaga😴💤",
  "‎tapos sunod ko bunso mo😴💤",
  "‎lalantakan ko puke nyang pinkish😴💤",
  "‎sisirain ko puke nya😴💤",
  "‎anlaki ng buratskels ko ipipilit ko pumasok😴💤",
  "‎habang nanonood kayo ng pamilya mo asong😴💤",
  "‎omcge kain kayo popcorn habang kinakantot ko kayo isa isa ng pamilya mo😴💤",
  "‎para may gana kayo😴💤",
  "‎wag moko takasan ah😴💤",
  "‎testingan kolang lakas mo kong may bitaw kaba😴💤",
  "‎may bitaw sana jan asung😴💤",
  "‎loko apaka hina neto😴💤",
  "‎tas palagi pang nag dd.o e no😴💤",
  "‎dashout sya saglit tas babalik nanaman😴💤",
  "‎sana bumilis ka magreply asung😴💤",
  "‎wla ka sa bilis ng reply ko sa tutuosin lungs😴💤",
  "‎kailangan mopa ng training😴💤",
  "‎dito kanga loko😴💤",
  "‎sapakin ko panga mo😴💤",
  "‎para ma dis alined yan😴💤",
  "‎tapos tabi mo mukha mo dito😴💤",
  "‎sasapakin ko😴💤",
  "‎para magka asymmetrical mukha mo haha😴💤",
  "‎nagmumukha kanang sahig jan😴💤",
  "‎mukhang sahig to😴💤",
  "‎hoy mukha kang sahig😴💤",
  "‎pst kaya paba asung😴💤",
  "‎magsabi kalang😴💤",
  "‎naghahanap to paraan para tigilan ko sya😴💤",
  "‎sana wag to lumihis sakin😴💤",
  "‎wlang matutulog dito btw way😴💤",
  "‎kayanin mo lang ako magdamag asung😴💤",
  "‎achu kita bleh😴💤",
  "‎antabok ng puke ng nanay mo😴💤",
  "‎tsaka antaba ng bilbil mo😴💤",
  "‎sakitin to😴💤",
  "‎wlang exercise to😴💤",
  "‎panay taba lang😴💤",
  "‎kelan magbabawas to ng timbang😴💤",
  "‎sana hindi to magcollapse habang kinukulata ko😴💤",
  "‎badingdong ka taba😴💤",
  "‎bawasan mo kabadingan mo😴💤",
  "‎andami nang bading sa mundo dumadagdag kapang asuh ka😴💤",
  "‎legit asuh kita😴💤",
  "‎papakainin kita mamaya feeds ng asuh😴💤",
  "‎pagtapos ipapalunok ko sayo😴💤",
  "‎hanggang sa matilaukan ka asung😴💤",
  "‎sana wag to mag d.o😴💤",
  "‎lalapain kita dito magdamag tabaa😴💤",
  "‎kayanin moko magdamag ah asung😴💤",
  "omcge lampaso ko ulo😴💤",
  "‎butsogan mo lang haha😴💤 ",
  "‎kulata tlga inabut sakin neto😴💤",
  "‎hindi pako nagpapawis e😴💤",
  "‎wag ka sana magwala huhu😴💤",
  "antigas ng utenko😴💤",
  "‎wish ng bibig masupa utenko😴💤",
  "‎toothbrush muna jan bago mo lalaplapin utenkelsko😴💤",
  "‎napaka baho ng hinihinga mo😴💤",
  "‎amoy imburnal bibig neto😴💤",
  "‎gamit ako sampung condom😴💤",
  "‎bago moko susupain😴💤",
  "‎baka magka infection utenkelsko😴💤",
  "‎sa baho ng hinihinga mo taba😴💤",
  "‎ukslamba gawin kong punching bag tatay mo😴💤",
  "‎tapos kapag maboard ako sakanya isusunod kita taba😴💤",
  "‎bagay sainyo ng airpats mo gawing punching bag😴💤",
  "‎angtataba nyong pamilya😴💤",
  "‎puro kayo unlirice sa mang inasal😴💤",
  "‎kong iunli subo nyo nlng utenkelsko😴💤",
  "‎sge unli subo nyo utenko😴💤",
  "‎unahan ko muna sa ate mo😴💤",
  "‎ansarap ng bibig ng ate mo kapag sinusupa ako😴💤",
  "‎napapatirik mata ko sa sarap ng bibig nya😴💤",
  "‎tapos sunod ko nanay mo😴💤",
  "‎ipapalamas ko sakanya utenko😴💤",
  "‎hanggang sa lumipad ako sa sarap😴💤",
  "‎ansarap ng nanay mo haha😴💤",
  "‎sarap kantutin ng paulit ulit😴💤",
  "‎bubuwagin ko puke nya😴💤",
  "‎hanggang sa mamaga😴💤",
  "‎tapos sunod ko bunso mo😴💤",
  "‎lalantakan ko puke nyang pinkish😴💤",
  "‎sisirain ko puke nya😴💤",
  "‎anlaki ng buratskels ko ipipilit ko pumasok😴💤",
  "‎habang nanonood kayo ng pamilya mo asong😴💤",
  "‎omcge kain kayo popcorn habang kinakantot ko kayo isa isa ng pamilya mo😴💤",
  "‎para may gana kayo😴💤",
  "‎wag moko takasan ah😴💤",
  "‎testingan kolang lakas mo kong may bitaw kaba😴💤",
];

const sessions = global.GoatBot.aaaTrollV2Sessions
  || (global.GoatBot.aaaTrollV2Sessions = new Map());
const handledEvents = global.GoatBot.aaaTrollV2HandledEvents
  || (global.GoatBot.aaaTrollV2HandledEvents = new Map());

function normalize(text) {
  return String(text || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function isTrollTrigger(text) {
  return TROLL_TRIGGERS.has(normalize(text));
}

function normalizeID(value) {
  if (value && typeof value === "object") {
    value =
      value.id ||
      value.userFbId ||
      value.userID ||
      value.userId ||
      value.senderID ||
      value.senderId ||
      value.actorFbId;
  }
  return String(value || "");
}

function getEventSenderID(event) {
  return normalizeID(
    event.senderID
      || event.senderId
      || event.author
      || event.userID
      || event.userId
      || event.userFbId
      || event.actorID
      || event.actorId
      || event.actorFbId
      || event.from
      || event.sender?.id
      || event.sender?.userFbId
      || event.sender?.userID
      || event.sender?.userId
      || ""
  );
}

function getReplySenderID(event) {
  const reply = event.messageReply;
  return normalizeID(
    reply?.senderID
      || reply?.senderId
      || reply?.sender?.id
      || reply?.sender?.userFbId
      || ""
  );
}

function sendMessage(api, message, threadID) {
  return new Promise(resolve => {
    let settled = false;
    const finish = (err, info) => {
      if (settled) return;
      settled = true;

      // Some FCA-compatible clients return message info as the only callback
      // argument instead of using the conventional (error, info) signature.
      if (
        info === undefined &&
        err &&
        typeof err === "object" &&
        !(err instanceof Error) &&
        !Object.prototype.hasOwnProperty.call(err, "error")
      ) {
        info = err;
        err = null;
      }

      resolve({ err, info });
    };

    try {
      const result = api.sendMessage(message, threadID, finish);
      if (result && typeof result.then === "function") {
        result.then(info => finish(null, info)).catch(err => finish(err));
      }
    } catch (err) {
      finish(err);
    }

    setTimeout(() => finish(new Error("sendMessage timed out")), 10000);
  });
}

function react(api, reaction, messageID, threadID) {
  if (!messageID || !threadID || typeof api.setMessageReaction !== "function") return;
  try {
    const result = api.setMessageReaction(reaction, messageID, threadID, () => {}, true);
    if (result && typeof result.catch === "function") {
      result.catch(error => {
        console.error("[TROLL] reaction failed:", error?.message || error);
      });
    }
  } catch (_) {}
}

async function sendTrollLine(api, session) {
  const line = TROLL_LINES[session.lineIndex % TROLL_LINES.length];
  const lineNumber = session.lineIndex + 1;
  session.lineIndex++;
  const body = `${line} @${session.targetName}`;
  // Do not make the next line wait for FCA's MQTT ACK. The first message can
  // already be visible in Messenger while that ACK is still pending.
  void sendMessage(api, {
    body,
    mentions: [{
      tag: session.targetName,
      id: session.targetID,
      fromIndex: line.length + 1
    }]
  }, session.threadID).then(sent => {
    if (!sent.err) {
      react(api, BOT_REACTION, sent.info?.messageID, session.threadID);
      console.log(`[TROLL] sent line ${lineNumber} in thread ${session.threadID}`);
    } else {
      console.error(`[TROLL] failed to send line ${lineNumber}:`, sent.err);
    }
  }).catch(error => {
    console.error(`[TROLL] send line ${lineNumber} crashed:`, error);
  });
}

async function drainSession(api, session) {
  if (session.draining) return;
  session.draining = true;

  try {
    while (session.active && session.pendingMessages > 0) {
      session.pendingMessages--;
      sendTrollLine(api, session);
    }
  } finally {
    session.draining = false;
    if (session.active && session.pendingMessages > 0) {
      void drainSession(api, session);
    }
  }
}

module.exports = {
  config: {
    name: "aaa.trollv2",
    version: "1.0.0",
    author: "Siegfried Samá",
    countDown: 0,
    role: 0,
    description: { en: "No-prefix, reply-triggered line-by-line troll" },
    category: "fun",
    guide: { en: "Reply \"kulatain moto\" to a person's message, then say \"okay na\" to stop" }
  },

  onStart: async function () {},

  onChat: handleChat,
  onAnyEvent: handleChat
};

async function handleChat({ api, event, usersData }) {
  event = event || {};
  const threadID = event.threadID;
  const senderID = getEventSenderID(event) || normalizeID(event.userID);
  const eventType = String(event.type || "").toLowerCase();
  const looksLikeMessage =
    eventType === "message" ||
    eventType === "message_reply" ||
    event.body ||
    event.messageReply;

  if (!looksLikeMessage || !threadID) return;

  // onAnyEvent and onChat can both receive the same Messenger message.
  // Process it once so one target message cannot consume two troll lines.
  const messageID = String(event.messageID || "");
  if (messageID && handledEvents.has(messageID)) return;
  if (messageID) {
    handledEvents.set(messageID, Date.now());
    setTimeout(() => handledEvents.delete(messageID), 30000);
  }

  const session = sessions.get(threadID);
  const body = normalize(event.body);
  if (session || isTrollTrigger(body)) {
    console.log(
      `[TROLL] event type=${eventType || "unknown"} thread=${threadID} ` +
      `sender=${senderID || "unknown"} body=${body.slice(0, 80)}`
    );
  }

  if (!senderID || senderID === String(api.getCurrentUserID?.() || "")) return;

  if (senderID === GOD_UID && body === STOP_TRIGGER && session) {
    session.active = false;
    session.pendingMessages = 0;
    sessions.delete(threadID);
    react(api, "❤️", event.messageID, threadID);
    await sendMessage(api, "sige boss sieg", threadID);
    return;
  }

  const replySenderID = getReplySenderID(event);

  if (senderID === GOD_UID && isTrollTrigger(body) && replySenderID) {
    if (session) return;

    const targetID = String(replySenderID);
    const botID = String(api.getCurrentUserID?.() || "");
    if (targetID === senderID || targetID === botID) return;

    let targetName = targetID;
    try {
      targetName = (await usersData.getName(targetID)) || targetID;
    } catch (_) {}
    targetName = String(targetName).replace(/^@+/, "").trim() || targetID;

    sessions.set(threadID, {
      active: true,
      draining: false,
      pendingMessages: 1,
      lineIndex: 0,
      threadID,
      targetID,
      targetName: String(targetName).trim() || targetID
    });
    console.log(`[TROLL] session started in thread ${threadID} for target ${targetID}`);
    void drainSession(api, sessions.get(threadID));
    return;
  }

  if (!session || !session.active) return;
  if (senderID !== String(session.targetID)) {
    console.log(`[TROLL] ignored sender ${senderID || "unknown"}; waiting for target ${session.targetID}`);
    return;
  }

  session.pendingMessages++;
  console.log(`[TROLL] target activity detected in thread ${threadID}; queued line ${session.lineIndex + session.pendingMessages}`);
  void drainSession(api, session);
}
