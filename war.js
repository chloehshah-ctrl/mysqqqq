module.exports = {
  config: {
    name: "dogmode",
    version: "1",
    author: "Siegfried Samá",
    countDown: 10,
    role: 2,
    description: { en: "hmmm" },
    category: "group",
    usages: "[]"
  },

  onStart: async function ({ api, event }) {
    const { threadID } = event;
    const a = (msg) => api.sendMessage(msg, threadID);
    a("putanginamuka");
    setTimeout(() => { a({ body: "sana nagpakantot ka nlng sakin" }); }, 3000);
    setTimeout(() => { a({ body: "sarap mong kantutin hanggang sa ikamatay mo e" }); }, 5000);
    setTimeout(() => { a({ body: "tapos iinom ako ng pampalaki ng uten" }); }, 7000);
    setTimeout(() => { a({ body: "kapag lumaki na buwat ko,ipapasok ko sa puke mo hanggang sa magdugo" }); }, 9000);
    setTimeout(() => { a({ body: "ipuputok ko sa kipay mo ang isang balde kong tamod" }); }, 12000);
    setTimeout(() => { a({ body: "para mabuntis ka haha" }); }, 15000);
    setTimeout(() => { a({ body: "mabubuntis ka tas manganganak ka ng kambal na kamukha mong ungas ka" }); }, 17000);
    setTimeout(() => { a({ body: "pagtapos mo manganak, iiwan kita sa ere kasi hindi kita kayang buhaying hampas lupa ka" }); }, 20000);
    setTimeout(() => { a({ body: "haha kapag lumaki nayang anak ko sayo na dalawang babae sila nmn ang kakantutin Ko" }); }, 23000);
    setTimeout(() => { a({ body: "kasi nabitin ako sayo" }); }, 25000);
    setTimeout(() => { a({ body: "nabitin ako sa puke mo" }); }, 28500);
    setTimeout(() => { a({ body: "kaya ung anak ko sayo ang kakantutin ko" }); }, 31000);
    setTimeout(() => { a({ body: "kambal yan na babae ung isa kinakantut ko tapos ung isa nilalaplap ko" }); }, 36000);
    setTimeout(() => { a({ body: "tapos ikaw nasa unahan pinapanood mo kami" }); }, 39000);
    setTimeout(() => { a({ body: "hanggang sa mainggit ka kong paano ko kinakantut ang anak natin" }); }, 40000);
    setTimeout(() => { a({ body: "syempre hindi pwedeng hindi ka kasali ipapalunok ko sayo ang buwat ko" }); }, 65000);
    setTimeout(() => { a({ body: "tatlo kayo ng mga anak natin sasalohin nyo ang tamodKo habang nakabukaka ang mga bibig nyo sa baba ng utenko" }); }, 70000);
    setTimeout(() => { a({ body: "kapag pumutok na sa bibig nyo" }); }, 75000);
    setTimeout(() => { a({ body: "iinom ako ng sampung robust para makapag refill ako" }); }, 80000);
    setTimeout(() => { a({ body: "after that, continue ko ulit ang pagpapakain ko sayo ng uten" }); }, 85000);
    setTimeout(() => { a(""); }, 90000);
    setTimeout(() => { a({ body: "lagyan ko ng ice cream utenko, para dun nyo dilaan" }); }, 95000);
    setTimeout(() => { a({ body: "unli subo kayo sakin" }); }, 100000);
    setTimeout(() => { a({ body: "ansarap ng anak natin" }); }, 105000);
    setTimeout(() => { a({ body: "lalo na ikaw engot" }); }, 115000);
  }
};
