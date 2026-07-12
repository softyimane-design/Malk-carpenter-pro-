var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "10mb" }));
var aiInstance = null;
function getGeminiClient() {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. Active AI assistant and scanner features will use rich offline premium fallback simulation.");
    }
    aiInstance = new import_genai.GoogleGenAI({
      apiKey: key || "MOCK_KEY_OFFLINE",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiInstance;
}
async function fetchImageAsBase64(url) {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString("base64");
  } catch (e) {
    console.error("Failed to fetch image as base64", e);
    return "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  }
}
app.post("/api/gemini/assistant", async (req, res) => {
  try {
    const { history, language } = req.body;
    const message = req.body.message || req.body.prompt;
    if (!message) {
      return res.status(400).json({ error: "Message/prompt is required" });
    }
    const key = process.env.GEMINI_API_KEY;
    const isArabic = language === "ar" || req.body.language === "ar";
    if (!key || key === "MY_GEMINI_API_KEY") {
      const fallbackReplies = {
        ar: `**\u0646\u0635\u064A\u062D\u0629 \u062A\u0642\u0646\u064A\u0629 \u0645\u0646 \u0627\u0644\u0645\u0639\u0644\u0645 \u0645\u0627\u0644\u0643**: \u0643\u064A \u062A\u0643\u0648\u0646 \u062A\u062E\u062F\u0645 \u0641\u064A \u0643\u0627\u062F\u0631 \u0648\u0644\u0627 \u0634\u0645\u0628\u0631\u0629 \u062A\u0627\u0639 \u0644\u0648\u062D\u060C \u0644\u0627\u0632\u0645 \u062A\u062A\u0623\u0643\u062F \u0628\u0627\u0644\u0644\u064A \u0627\u0644\u0631\u0637\u0648\u0628\u0629 \u062A\u0627\u0639 \u0627\u0644\u062D\u0637\u0628 \u0631\u0627\u0647\u064A \u0628\u064A\u0646 6% \u0648 8% \u0628\u0627\u0634 \u0627\u0644\u0644\u0648\u062D \u0645\u0627 \u064A\u062A\u0639\u0648\u062C\u0644\u0643\u0634 \u0645\u0628\u0639\u062F. \u0628\u0627\u0644\u0646\u0633\u0628\u0629 \u0644\u0644\u062A\u0639\u0634\u064A\u0642 \u0648\u0627\u0644\u062A\u0631\u0643\u0627\u0628\u060C \u062F\u064A\u0631 "\u0627\u0644\u0644\u0633\u0627\u0646 \u0648\u0627\u0644\u0646\u0634\u0628\u0629" (mortise and tenon) \u0648\u0644\u0627 "\u0627\u0644\u0628\u0648\u0634\u0648\u0646" (pocket holes) \u0628\u0627\u0634 \u0627\u0644\u062E\u062F\u0645\u0629 \u062A\u062C\u064A \u0635\u062D\u064A\u062D\u0629 \u0648\u0633\u0627\u0647\u0644\u0629 \u0648\u062A\u0648\u062C\u062F \u0641\u064A \u0648\u0642\u062A \u0642\u0635\u064A\u0631.
        
\u0643\u064A\u0641\u0627\u0634 \u0646\u0642\u062F\u0631 \u0646\u0639\u0627\u0648\u0646\u0643 \u0627\u0644\u064A\u0648\u0645 \u0641\u064A \u0639\u0628\u0627\u0631 \u0627\u0644\u0633\u0644\u0639\u0629 \u0648\u0644\u0627 \u0644\u064A\u0633\u062A\u0629 \u062A\u0627\u0639 \u0627\u0644\u0642\u0636\u064A\u0627\u0646 \u0644\u0644\u0634\u0627\u0646\u0637\u064A \u062A\u0627\u0639\u0643\u061F`,
        default: `**Malik Pro Technical Tip**: When constructing cabinetry, ensure wood moisture content is between 6% and 8% to prevent warping. For joints, look into the blind mortise and tenon or pocket holes for fast, modern assembly.
        
How else can I help with your project measurements or shopping lists today?`
      };
      const reply = isArabic ? fallbackReplies.ar : fallbackReplies.default;
      return res.json({
        text: reply,
        reply
      });
    }
    const ai = getGeminiClient();
    const formattedHistory = (history || []).map((h) => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.content }]
    }));
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: `You are the master craftsman AI advisor for "Malik Carpenter Pro". 
        You are an expert luxury woodworker, senior furniture designer, CAD drafts engineer, and project estimator.
        You speak fluently in English, French, and Arabic. 
        If the language is Arabic (ar), you MUST reply in natural, friendly, and authentic Algerian Arabic dialect (Darja / \u0627\u0644\u062F\u0627\u0631\u062C\u0629 \u0627\u0644\u062C\u0632\u0627\u0626\u0631\u064A\u0629) combined with professional woodworking terms. Use popular Algerian woodwork jargon like "\u0627\u0644\u0634\u0627\u0646\u0637\u064A" (workspace/project site), "\u0627\u0644\u062E\u062F\u0627\u0645\u064A\u0646" (workers), "\u0627\u0644\u0633\u0644\u0639\u0629" (materials/stock), "\u0627\u0644\u062F\u0631\u0627\u0647\u0645" (money/price), "\u0627\u0644\u0641\u064A\u0637\u0648\u0631\u0629" (invoice), "\u0644\u0648\u062D" (timber), "\u0643\u0627\u062F\u0631" (frame), "\u0627\u0644\u0634\u0645\u0628\u0631\u0629" (room) to make Algerian carpenters feel completely at home, while providing extremely clear, professional, and accurate advice.
        Provide technically detailed answers. Always include:
        1. Precise wood species suggestions (Walnut, Oak, Beech, MDF, Plywood).
        2. Professional joint styles (Dovetail, Mortise & Tenon, Biscuit, Pocket-Hole).
        3. Clear material optimization suggestions to reduce waste.
        Be professional, humble, supportive, and practical.`
      },
      history: formattedHistory
    });
    const result = await chat.sendMessage({ message });
    res.json({ text: result.text, reply: result.text });
  } catch (error) {
    console.error("Assistant Error:", error);
    res.status(500).json({ error: error.message || "Error executing assistant request" });
  }
});
app.post("/api/gemini/carpenter-planner", async (req, res) => {
  try {
    const {
      projectName,
      itemType,
      dimensions,
      // { width, height, depth }
      woodType,
      boardSize,
      // { width, height }
      parts,
      // Array of { name, length, width, quantity }
      materialUnitCost,
      laborRate,
      markup,
      language
    } = req.body;
    const isArabic = language === "ar";
    const isFrench = language === "fr";
    const key = process.env.GEMINI_API_KEY;
    const totalPartsAreaM2 = (parts || []).reduce((acc, p) => acc + p.length * p.width * p.quantity / 1e4, 0);
    const rawBoardAreaM2 = boardSize.width * boardSize.height / 1e4;
    const boardsNeeded = Math.max(1, Math.ceil(totalPartsAreaM2 * 1.2 / rawBoardAreaM2));
    const thicknessM = woodType.toLowerCase().includes("mdf") || woodType.toLowerCase().includes("plywood") ? 0.018 : 0.04;
    const calculatedVolumeM3 = totalPartsAreaM2 * thicknessM;
    const woodMaterialsCost = boardsNeeded * Number(materialUnitCost);
    const hardwareCost = Math.round(woodMaterialsCost * 0.15);
    const estLaborHours = Math.max(8, Math.round(totalPartsAreaM2 * 15));
    const laborCost = estLaborHours * Number(laborRate);
    const totalBaseCost = woodMaterialsCost + hardwareCost + laborCost;
    const markupMultiplier = 1 + Number(markup) / 100;
    const recommendedSellingPrice = Math.round(totalBaseCost * markupMultiplier);
    const netProfit = recommendedSellingPrice - totalBaseCost;
    const profitMargin = Math.round(netProfit / recommendedSellingPrice * 100);
    const roi = Math.round(netProfit / totalBaseCost * 100);
    if (!key || key === "MY_GEMINI_API_KEY" || key === "MOCK_KEY_OFFLINE") {
      const formatNum = (n) => n.toLocaleString();
      const offlineResponse = {
        woodQuantity: isArabic ? `${calculatedVolumeM3.toFixed(4)} \u0645\u062A\u0631 \u0645\u0643\u0639\u0628 \u0645\u0646 ${woodType}. \u0633\u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u062D\u0648\u0627\u0644\u064A ${boardsNeeded} \u0644\u0648\u062D \u0642\u064A\u0627\u0633\u064A (\u0623\u0628\u0639\u0627\u062F ${boardSize.width}\xD7${boardSize.height} \u0633\u0645).` : isFrench ? `${calculatedVolumeM3.toFixed(4)} m\xB3 de ${woodType}. Vous aurez besoin d'environ ${boardsNeeded} panneaux standards (${boardSize.width}x${boardSize.height} cm).` : `${calculatedVolumeM3.toFixed(4)} m\xB3 of ${woodType}. You will need approximately ${boardsNeeded} standard boards (${boardSize.width}x${boardSize.height} cm).`,
        materialEstimation: isArabic ? `\u2022 \u0623\u0644\u0648\u0627\u062D \u0627\u0644\u062E\u0634\u0628: ${boardsNeeded} \u0644\u0648\u062D \u0645\u0646 ${woodType}
\u2022 \u0627\u0644\u0628\u0631\u0627\u063A\u064A: 150 \u062D\u0628\u0629 \u0628\u0631\u0627\u063A\u064A \u062A\u062C\u0645\u064A\u0639 \u0646\u062C\u0627\u0631\u0629 \u0645\u062E\u0635\u0635\u0629
\u2022 \u0645\u0641\u0635\u0644\u0627\u062A \u0648\u0625\u0643\u0633\u0633\u0648\u0627\u0631\u0627\u062A: 4x \u0645\u0641\u0635\u0644\u0627\u062A \u0630\u0643\u064A\u0629 \u0628\u0644\u0648\u0645 \u0645\u062E\u0641\u064A\u0629
\u2022 \u0645\u0648\u0627\u062F \u0627\u0644\u062A\u0634\u0637\u064A\u0628: 3 \u0644\u062A\u0631 \u0641\u064A\u0631\u0646\u064A (\u0635\u0628\u064A\u063A\u0629 \u062D\u0637\u0628) \u0648\u063A\u0631\u0627\u0621 \u0646\u062C\u0627\u0631\u0629 \u0646\u0648\u0639 \u0623\u0648\u0644.` : isFrench ? `\u2022 Panneaux : ${boardsNeeded} panneaux de ${woodType}
\u2022 Vis : 150 vis d'assemblage sp\xE9cialis\xE9es
\u2022 Quincaillerie : 4x charni\xE8res invisibles Blum de haute qualit\xE9
\u2022 Finition : 3L de vernis polyur\xE9thane et colle \xE0 bois forte.` : `\u2022 Boards: ${boardsNeeded} boards of ${woodType}
\u2022 Screws: 150 heavy-duty assembly screws
\u2022 Hardware: 4x premium Blum soft-close concealed hinges
\u2022 Consumables: 3L premium varnish/stain & titebond glue.`,
        costEstimation: isArabic ? `\u2022 \u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0623\u0644\u0648\u0627\u062D: ${formatNum(woodMaterialsCost)} \u062F.\u062C
\u2022 \u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u062E\u0631\u062F\u0648\u0627\u062A \u0648\u0627\u0644\u063A\u0631\u0627\u0621: ${formatNum(hardwareCost)} \u062F.\u062C
\u2022 \u062A\u0643\u0644\u0641\u0629 \u064A\u062F \u0627\u0644\u0639\u0645\u0644 (${estLaborHours} \u0633\u0627\u0639\u0629): ${formatNum(laborCost)} \u062F.\u062C
\u2022 \u0645\u062C\u0645\u0648\u0639 \u0627\u0644\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629: ${formatNum(totalBaseCost)} \u062F.\u062C` : isFrench ? `\u2022 Co\xFBt des panneaux : ${formatNum(woodMaterialsCost)} \u20AC
\u2022 Quincaillerie & consommables : ${formatNum(hardwareCost)} \u20AC
\u2022 Main d'\u0153uvre (${estLaborHours}h) : ${formatNum(laborCost)} \u20AC
\u2022 Co\xFBt total de revient : ${formatNum(totalBaseCost)} \u20AC` : `\u2022 Board Materials: $${formatNum(woodMaterialsCost)}
\u2022 Hardware & Consumables: $${formatNum(hardwareCost)}
\u2022 Craft Labor (${estLaborHours} hours): $${formatNum(laborCost)}
\u2022 Total Cost of Production: $${formatNum(totalBaseCost)}`,
        cuttingInstructions: isArabic ? `1. \u0642\u0645 \u0628\u062A\u0633\u0648\u064A\u0629 \u062D\u0648\u0627\u0641 \u0627\u0644\u0623\u0644\u0648\u0627\u062D \u0623\u0648\u0644\u0627\u064B \u0644\u0644\u062A\u062E\u0644\u0635 \u0645\u0646 \u0627\u0644\u0639\u064A\u0648\u0628.
2. \u0627\u0642\u0637\u0639 \u0627\u0644\u0642\u0637\u0639 \u0627\u0644\u0643\u0628\u064A\u0631\u0629 \u0623\u0648\u0644\u0627\u064B (${parts && parts[0] ? parts[0].name : "\u0627\u0644\u0647\u064A\u0643\u0644 \u0627\u0644\u062E\u0627\u0631\u062C\u064A"}).
3. \u0627\u0633\u062A\u063A\u0644 \u0627\u0644\u0641\u0631\u0627\u063A\u0627\u062A \u0627\u0644\u0645\u062A\u0628\u0642\u064A\u0629 \u0644\u0642\u0635 \u0627\u0644\u0623\u062C\u0632\u0627\u0621 \u0627\u0644\u0635\u063A\u064A\u0631\u0629 \u0644\u062A\u0642\u0644\u064A\u0644 \u0627\u0644\u0641\u0627\u0642\u062F.
4. \u0627\u0633\u062A\u0639\u0645\u0644 \u0645\u0646\u0634\u0627\u0631 \u0633\u0643\u0629 (Track Saw) \u0644\u0636\u0645\u0627\u0646 \u0632\u0648\u0627\u064A\u0627 \u0642\u0627\u0626\u0645\u0629 90 \u062F\u0631\u062C\u0629 \u0628\u0627\u0644\u062A\u0645\u0627\u0645.` : isFrench ? `1. Pr\xE9parez et d\xE9gauchissez les chants de vos panneaux.
2. D\xE9bitez d'abord les plus grandes pi\xE8ces (${parts && parts[0] ? parts[0].name : "les panneaux principaux"}).
3. Optimisez les chutes pour d\xE9couper les petites pi\xE8ces secondaires.
4. Utilisez une scie sous table ou une scie plongeante avec rail pour garantir des coupes parfaitement rectilignes \xE0 90\xB0.` : `1. True and square the edges of your raw boards first.
2. Rough cut the largest parts first (${parts && parts[0] ? parts[0].name : "main carcass/panels"}).
3. Arrange smaller support pieces in the remaining offcut sections.
4. Use a track saw or guide system to ensure perfectly straight 90-degree cuts.`,
        boardOptimization: `
+-----------------------------------------------------------+
|  [ ${parts && parts[0] ? parts[0].name : "Part 1"} ]   | [ ${parts && parts[1] ? parts[1].name : "Part 2"} ]   |  (Scrap)  |
|  ${parts && parts[0] ? `${parts[0].length}x${parts[0].width}` : "100x50"}cm   | ${parts && parts[1] ? `${parts[1].length}x${parts[1].width}` : "50x50"}cm   |           |
+-----------------------------------------------------------+
|  [ ${parts && parts[2] ? parts[2].name : "Part 3"} ]   |  [ Offcut / Wood Shavings / Restes de bois ]      |
+-----------------------------------------------------------+
[\u0646\u0638\u0627\u0645 \u0627\u0644\u062A\u0642\u0637\u064A\u0639 \u0627\u0644\u0645\u0639\u064A\u0627\u0631\u064A \u0644\u0644\u0645\u0639\u0644\u0651\u0645 \u0645\u0627\u0644\u0643 - Malik Cutting Map - \xC9co-d\xE9coupe v2.5]
`,
        wasteReductionTips: isArabic ? `\u2022 \u0628\u0642\u0627\u064A\u0627 \u0627\u0644\u0642\u0637\u0639 (\u0627\u0644\u0634\u0646\u0627\u0637\u064A\u0641) \u064A\u0645\u0643\u0646 \u0642\u0635\u0647\u0627 \u0648\u062A\u062C\u0647\u064A\u0632\u0647\u0627 \u0644\u0635\u0646\u0639 \u0643\u0648\u0627\u0628\u064A\u0644 \u0648\u0643\u062A\u0644 \u062A\u0642\u0648\u064A\u0629 \u0627\u0644\u0632\u0648\u0627\u064A\u0627 \u0627\u0644\u062F\u0627\u062E\u0644\u064A\u0629.
\u2022 \u0627\u062D\u0641\u0638 \u0646\u0634\u0627\u0631\u0629 \u0627\u0644\u062E\u0634\u0628 \u0627\u0644\u0646\u0627\u0639\u0645\u0629 \u0648\u062E\u0644\u0637\u0647\u0627 \u0645\u0639 \u063A\u0631\u0627\u0621 \u0627\u0644\u062E\u0634\u0628 \u0644\u0635\u0646\u0627\u0639\u0629 \u0645\u0639\u062C\u0648\u0646 \u062D\u0634\u0648 \u0645\u0645\u062A\u0627\u0632 \u0644\u0633\u062F \u0627\u0644\u0641\u062C\u0648\u0627\u062A \u0648\u0628\u0631\u0627\u063A\u064A \u0627\u0644\u062A\u062B\u0628\u064A\u062A.
\u2022 \u0646\u0633\u0651\u0642 \u0627\u062A\u062C\u0627\u0647 \u0639\u0631\u0648\u0642 \u0627\u0644\u062E\u0634\u0628 \u0628\u0627\u0644\u062A\u0648\u0627\u0632\u064A \u0644\u062A\u0642\u0644\u064A\u0644 \u0647\u062F\u0631 \u0645\u0633\u0627\u062D\u0627\u062A \u0627\u0644\u0632\u0648\u0627\u064A\u0627.` : isFrench ? `\u2022 Les chutes de d\xE9coupe peuvent \xEAtre fa\xE7onn\xE9es en tasseaux de renfort ou en chevilles d'assemblage.
\u2022 Conservez la sciure fine pour la m\xE9langer avec de la colle \xE0 bois afin d'obtenir un mastic d'une couleur parfaitement assortie.
\u2022 Alignez le fil du bois pour optimiser la disposition spatiale sur les panneaux.` : `\u2022 Use remaining long scrap pieces to create structural corner blocks or internal cleating.
\u2022 Save the clean sawdust and mix with wood glue to create custom grain-matched wood filler for pocket holes.
\u2022 Nest parts systematically by matching parallel grain direction to avoid awkward diagonal wastage.`,
        woodTypeAnalysis: isArabic ? `\u0646\u0648\u0639 \u0627\u0644\u062E\u0634\u0628 \u0627\u0644\u0645\u062E\u062A\u0627\u0631 (${woodType}) \u0645\u0645\u062A\u0627\u0632 \u0648\u0644\u0647 \u0645\u062A\u0627\u0646\u0629 \u0639\u0627\u0644\u064A\u0629. \u062D\u0637\u0628 \u0627\u0644\u062C\u0648\u0632 \u0648\u0627\u0644\u0628\u0644\u0648\u0637 \u064A\u0642\u0627\u0648\u0645\u0627\u0646 \u0627\u0644\u0635\u062F\u0645\u0627\u062A \u0628\u0634\u0643\u0644 \u0631\u0627\u0626\u0639\u060C \u0623\u0645\u0627 \u0623\u0644\u0648\u0627\u062D MDF \u0641\u0633\u0647\u0644\u0629 \u0627\u0644\u062A\u0634\u0643\u064A\u0644 \u0648\u0645\u062B\u0627\u0644\u064A\u0629 \u0644\u0644\u062F\u0647\u0627\u0646\u0627\u062A \u0627\u0644\u062D\u062F\u064A\u062B\u0629. \u0646\u0646\u0635\u062D \u0628\u0627\u0633\u062A\u0639\u0645\u0627\u0644 \u0637\u0628\u0642\u0629 \u0639\u0627\u0632\u0644\u0629 \u0644\u0644\u0631\u0637\u0648\u0628\u0629 \u0644\u062A\u062C\u0646\u0628 \u0627\u0644\u062A\u0645\u062F\u062F.` : isFrench ? `L'essence s\xE9lectionn\xE9e (${woodType}) est id\xE9ale pour ce projet. Le ch\xEAne et le noyer offrent une r\xE9sistance exceptionnelle et un veinage luxueux. Le MDF et le contreplaqu\xE9 sont parfaits pour les structures stables et les laques modernes. Appliquez toujours un primaire d'accroche hydrofuge.` : `The chosen species (${woodType}) is highly suitable. Solid hardwood (Oak/Walnut) provides outstanding tensile strength and gorgeous figuring. Engineered boards (MDF/Plywood) offer exceptional dimensional stability. Be sure to prime and seal all exposed edges.`,
        projectDuration: isArabic ? `\u2022 \u0627\u0644\u062A\u062E\u0637\u064A\u0637 \u0648\u0627\u0644\u0639\u0644\u0627\u0645: 2 \u0633\u0627\u0639\u0629
\u2022 \u0627\u0644\u062A\u0642\u0637\u064A\u0639 \u0648\u0627\u0644\u0642\u0635: 4 \u0633\u0627\u0639\u0627\u062A
\u2022 \u062D\u0641\u0631 \u0627\u0644\u062A\u0639\u0634\u064A\u0642 \u0648\u0627\u0644\u062A\u0631\u0643\u064A\u0628: 5 \u0633\u0627\u0639\u0627\u062A
\u2022 \u0627\u0644\u0635\u0646\u0641\u0631\u0629 \u0648\u0627\u0644\u062A\u0646\u0639\u064A\u0645 \u0648\u0627\u0644\u062F\u0647\u0627\u0646: 6 \u0633\u0627\u0639\u0627\u062A
\u2022 \u0627\u0644\u0645\u062C\u0645\u0648\u0639 \u0627\u0644\u0645\u0642\u062F\u0631: ${estLaborHours} \u0633\u0627\u0639\u0629 \u0639\u0645\u0644.` : isFrench ? `\u2022 Trac\xE9 & Marquage : 2 heures
\u2022 D\xE9coupe & Calibrage : 4 heures
\u2022 Assemblage & Ajustements : 5 heures
\u2022 Pon\xE7age & Finitions : 6 heures
\u2022 Total estim\xE9 : ${estLaborHours} heures d'atelier.` : `\u2022 Layout & Marking: 2 hours
\u2022 Precision Cutting: 4 hours
\u2022 Joinery & Framing: 5 hours
\u2022 Sanding & Lacquering: 6 hours
\u2022 Total active workshop time: ${estLaborHours} hours.`,
        sellingPriceRecommendation: isArabic ? `\u0646\u0646\u0635\u062D \u0628\u0628\u064A\u0639 \u0647\u0630\u0627 \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0628\u0633\u0639\u0631 ${formatNum(recommendedSellingPrice)} \u062F.\u062C. \u0647\u0630\u0627 \u0627\u0644\u0633\u0639\u0631 \u064A\u0636\u0645\u0646 \u0644\u0643 \u0627\u0633\u062A\u0631\u062F\u0627\u062F \u062A\u0643\u0627\u0644\u064A\u0641 \u0627\u0644\u0645\u0648\u0627\u062F \u0648\u0627\u0644\u062C\u0647\u062F \u0648\u064A\u0645\u0646\u062D\u0643 \u0631\u0628\u062D\u0627\u064B \u0635\u0627\u0641\u064A\u0627\u064B \u0642\u062F\u0631\u0647 ${formatNum(netProfit)} \u062F.\u062C (\u0628\u0647\u0627\u0645\u0634 \u0631\u0628\u062D ${profitMargin}% \u0648\u0639\u0627\u0626\u062F \u0639\u0644\u0649 \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 ${roi}%).` : isFrench ? `Nous vous sugg\xE9rons un prix de vente de ${formatNum(recommendedSellingPrice)} \u20AC. Cela couvre les co\xFBts de revient et vous assure un b\xE9n\xE9fice net de ${formatNum(netProfit)} \u20AC (Marge b\xE9n\xE9ficiaire de ${profitMargin}% et un retour sur investissement de ${roi}%).` : `We suggest a selling price of $${formatNum(recommendedSellingPrice)}. This covers all overheads and delivers a clean net profit of $${formatNum(netProfit)} (Profit margin: ${profitMargin}%, ROI: ${roi}%).`,
        projectRisks: isArabic ? `\u2022 \u062E\u0637\u0631 \u0627\u0644\u062A\u0642\u0648\u0633: \u0627\u0644\u0623\u0644\u0648\u0627\u062D \u0627\u0644\u0639\u0631\u064A\u0636\u0629 \u0645\u0646 \u0627\u0644\u062E\u0634\u0628 \u0627\u0644\u0635\u0644\u0628 \u0642\u062F \u062A\u062A\u0642\u0648\u0633 \u0625\u0630\u0627 \u0644\u0645 \u062A\u062F\u0639\u0645 \u0628\u0639\u0648\u0627\u0631\u0636 \u0633\u0641\u0644\u064A\u0629 \u0642\u0648\u064A\u0629.
\u2022 \u0627\u0644\u0631\u0637\u0648\u0628\u0629: \u0625\u0630\u0627 \u0643\u0627\u0646\u062A \u0627\u0644\u0631\u0637\u0648\u0628\u0629 \u0639\u0627\u0644\u064A\u0629 \u0641\u064A \u0627\u0644\u0648\u0631\u0634\u0629\u060C \u0627\u062A\u0631\u0643 \u0627\u0644\u062E\u0634\u0628 \u064A\u062A\u0623\u0642\u0644\u0645 \u0644\u0645\u062F\u0629 48 \u0633\u0627\u0639\u0629 \u0642\u0628\u0644 \u0627\u0644\u062A\u0642\u0637\u064A\u0639.
\u2022 \u0627\u0644\u062D\u0645\u0648\u0644\u0629 \u0627\u0644\u0632\u0627\u0626\u062F\u0629: \u062A\u0623\u0643\u062F \u0645\u0646 \u062A\u062F\u0639\u064A\u0645 \u0627\u0644\u0631\u0641\u0648\u0641 \u0627\u0644\u0637\u0648\u064A\u0644\u0629 \u0627\u0644\u062A\u064A \u062A\u062A\u062C\u0627\u0648\u0632 90 \u0633\u0645 \u0644\u062A\u0641\u0627\u062F\u064A \u0627\u0646\u062D\u0646\u0627\u0626\u0647\u0627.` : isFrench ? `\u2022 Risque de Tuilage : Les panneaux larges en bois massif peuvent se d\xE9former sans renforts transversaux.
\u2022 Humidit\xE9 : Laissez le bois s'acclimater \xE0 l'atelier pendant 48 heures avant le d\xE9bit.
\u2022 Fl\xE9chissement : Renforcez les \xE9tag\xE8res de plus de 90 cm pour \xE9viter qu'elles ne cintrent sous le poids.` : `\u2022 Cupping Risk: Wide solid panels may cup if not braced with sliding dovetails or steel C-channels underneath.
\u2022 Moisture issues: Allow wood to acclimate to your local workshop humidity for at least 48 hours before cutting.
\u2022 Sagging Shelves: Long spans exceeding 90cm should be reinforced or use thicker substrate to avoid deflection under load.`,
        cheaperAlternatives: isArabic ? `\u2022 \u0627\u0633\u062A\u0628\u062F\u0644 \u0627\u0644\u0647\u064A\u0627\u0643\u0644 \u0627\u0644\u062F\u0627\u062E\u0644\u064A\u0629 \u0628\u0640 MDF \u0627\u0644\u0645\u0644\u0628\u0633 \u0628\u0642\u0634\u0631\u0629 \u062E\u0634\u0628 \u0637\u0628\u064A\u0639\u064A \u0648\u062D\u0627\u0641\u0638 \u0639\u0644\u0649 \u0627\u0644\u062D\u0648\u0627\u0641 \u0627\u0644\u062E\u0627\u0631\u062C\u064A\u0629 \u062E\u0634\u0628 \u0635\u0644\u0628\u060C \u0645\u0645\u0627 \u064A\u0648\u0641\u0631 \u062D\u0648\u0627\u0644\u064A 30% \u0645\u0646 \u0627\u0644\u062A\u0643\u0644\u0641\u0629.
\u2022 \u0627\u0633\u062A\u0639\u0645\u0644 \u0628\u0631\u0627\u063A\u064A \u062C\u064A\u0628\u064A\u0629 \u0645\u062E\u0641\u064A\u0629 (Pocket Holes) \u0628\u062F\u0644\u0627\u064B \u0645\u0646 \u0627\u0644\u0628\u0633\u0643\u0648\u064A\u062A \u0623\u0648 \u0627\u0644\u062F\u0648\u0645\u064A\u0646\u0648 \u0644\u062A\u0633\u0631\u064A\u0639 \u0627\u0644\u0639\u0645\u0644 \u0648\u062A\u0642\u0644\u064A\u0644 \u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0622\u0644\u0627\u062A.` : isFrench ? `\u2022 Utilisez du MDF replaqu\xE9 pour le caisson int\xE9rieur tout en gardant du bois massif pour les fa\xE7ades visibles, \xE9conomisant ainsi environ 30%.
\u2022 Optez pour des assemblages par vis biaises (Pocket Holes) plut\xF4t que des dominos pour r\xE9duire le temps de main d'\u0153uvre.` : `\u2022 Use veneered MDF or plywood for internal cabinet bodies and keep solid wood only for facing frames and doors. This saves up to 30%.
\u2022 Choose pocket hole joints instead of expensive domino mortising to speed up assembly and reduce tooling overheads.`,
        dailyWorkPlan: isArabic ? `\u2022 \u0627\u0644\u064A\u0648\u0645 1: \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u062E\u0637\u0637\u0627\u062A \u0627\u0644\u0647\u0646\u062F\u0633\u064A\u0629\u060C \u062A\u0633\u0648\u064A\u0629 \u062D\u0648\u0627\u0641 \u0627\u0644\u0623\u062E\u0634\u0627\u0628\u060C \u0648\u0627\u0644\u062A\u0642\u0637\u064A\u0639 \u0627\u0644\u062E\u0634\u0646 \u0644\u0644\u0623\u0644\u0648\u0627\u062D.
\u2022 \u0627\u0644\u064A\u0648\u0645 2: \u0642\u0635 \u0627\u0644\u0642\u0637\u0639 \u0628\u062F\u0642\u0629 \u0645\u062A\u0646\u0627\u0647\u064A\u0629 \u0648\u062D\u0641\u0631 \u0627\u0644\u0641\u062A\u062D\u0627\u062A \u0627\u0644\u0645\u0627\u0626\u0644\u0629 \u0648\u0627\u0644\u062A\u0639\u0634\u064A\u0642\u0627\u062A.
\u2022 \u0627\u0644\u064A\u0648\u0645 3: \u062A\u062C\u0645\u064A\u0639 \u0627\u0644\u0647\u064A\u0627\u0643\u0644 \u0627\u0644\u062F\u0627\u062E\u0644\u064A\u0629 \u0648\u0627\u0644\u0644\u0635\u0642 \u0628\u0627\u0644\u063A\u0631\u0627\u0621 \u0648\u0634\u062F \u0627\u0644\u0643\u0648\u0627\u0628\u064A\u0633 \u0648\u0627\u0644\u0643\u0644\u0627\u0628\u0627\u062A.
\u2022 \u0627\u0644\u064A\u0648\u0645 4: \u0627\u0644\u0635\u0646\u0641\u0631\u0629 \u0627\u0644\u0645\u062A\u062F\u0631\u062C\u0629 (120 -> 180 -> 240) \u0648\u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0637\u0628\u0642\u0629 \u0627\u0644\u0623\u0648\u0644\u0649 \u0645\u0646 \u0627\u0644\u0641\u064A\u0631\u0646\u064A \u0627\u0644\u0639\u0627\u0632\u0644.
\u2022 \u0627\u0644\u064A\u0648\u0645 5: \u0627\u0644\u0635\u0646\u0641\u0631\u0629 \u0627\u0644\u062E\u0641\u064A\u0641\u0629\u060C \u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0637\u0628\u0642\u0629 \u0627\u0644\u0646\u0647\u0627\u0626\u064A\u0629 \u0627\u0644\u0644\u0627\u0645\u0639\u0629\u060C \u0648\u0645\u0631\u0627\u0642\u0628\u0629 \u0627\u0644\u062C\u0648\u062F\u0629 \u0648\u0627\u0644\u062A\u0639\u0628\u0626\u0629.` : isFrench ? `\u2022 Jour 1 : Analyse du plan, dressage des chants et d\xE9bit de d\xE9grossissage.
\u2022 Jour 2 : D\xE9coupe pr\xE9cise \xE0 dimension, per\xE7age des liaisons et usinage des assemblages.
\u2022 Jour 3 : Pr\xE9montage \xE0 blanc, encollage, mise sous presse et vissage structurel.
\u2022 Jour 4 : Pon\xE7age progressif (grain 120 -> 180 -> 240) et application du primaire d'\xE9tanch\xE9it\xE9.
\u2022 Jour 5 : \xC9grenage fin, couche de finition protectrice, contr\xF4le de qualit\xE9 final.` : `\u2022 Day 1: Drafting review, board preparation, and rough lumber breaking.
\u2022 Day 2: Final precision sizing, drilling pocket joints and mortise/tenons.
\u2022 Day 3: Dry-fit checking, structural gluing, clamping, and screw reinforcement.
\u2022 Day 4: Progressive sanding (120 to 240 grit) and applying first sealing coat.
\u2022 Day 5: Fine denibbing, final lacquer coat application, and quality assurance checks.`,
        profitAnalysis: isArabic ? `\u2022 \u0633\u0639\u0631 \u0627\u0644\u0628\u064A\u0639 \u0627\u0644\u0645\u0642\u062A\u0631\u062D: ${formatNum(recommendedSellingPrice)} \u062F.\u062C
\u2022 \u0625\u062C\u0645\u0627\u0644\u064A \u062A\u0643\u0627\u0644\u064A\u0641 \u0627\u0644\u0645\u0648\u0627\u062F: ${formatNum(woodMaterialsCost + hardwareCost)} \u062F.\u062C
\u2022 \u0623\u062C\u0631 \u0627\u0644\u064A\u062F \u0627\u0644\u0639\u0627\u0645\u0644\u0629: ${formatNum(laborCost)} \u062F.\u062C
\u2022 \u0635\u0627\u0641\u064A \u0627\u0644\u0631\u0628\u062D \u0627\u0644\u0645\u0627\u0644\u064A: ${formatNum(netProfit)} \u062F.\u062C
\u2022 \u0647\u0627\u0645\u0634 \u0627\u0644\u0631\u0628\u062D \u0627\u0644\u0635\u0627\u0641\u064A: ${profitMargin}%
\u2022 \u0645\u0639\u062F\u0644 \u0627\u0644\u0639\u0627\u0626\u062F \u0639\u0644\u0649 \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631: ${roi}%` : isFrench ? `\u2022 Prix de vente sugg\xE9r\xE9 : ${formatNum(recommendedSellingPrice)} \u20AC
\u2022 Co\xFBt des mati\xE8res premi\xE8res : ${formatNum(woodMaterialsCost + hardwareCost)} \u20AC
\u2022 Co\xFBt de main d'\u0153uvre : ${formatNum(laborCost)} \u20AC
\u2022 B\xE9n\xE9fice net d'atelier : ${formatNum(netProfit)} \u20AC
\u2022 Marge de profit : ${profitMargin}%
\u2022 Retour sur investissement (ROI) : ${roi}%` : `\u2022 Suggested Sales Revenue: $${formatNum(recommendedSellingPrice)}
\u2022 Total Raw Materials Cost: $${formatNum(woodMaterialsCost + hardwareCost)}
\u2022 Workshop Craft Wages: $${formatNum(laborCost)}
\u2022 Net Workshop Profit: $${formatNum(netProfit)}
\u2022 Net Profit Margin: ${profitMargin}%
\u2022 Return on Capital (ROI): ${roi}%`
      };
      return res.json({ result: offlineResponse, plan: offlineResponse });
    }
    const ai = getGeminiClient();
    const systemPrompt = `You are the ultimate Woodworking Estimator & CAD Engineering AI for "Malik Carpenter Pro".
Your goal is to provide a comprehensive, production-ready, highly technical woodworking plan for building a: ${itemType} (dimensions ${dimensions.width}x${dimensions.height}x${dimensions.depth} cm) made of ${woodType}.
The standard raw stock board size is ${boardSize.width}x${boardSize.height} cm.
The parts list is: ${JSON.stringify(parts)}.
The cost of material per standard raw board is ${materialUnitCost} USD/DA.
The labor cost per hour is ${laborRate} USD/DA.
Desired profit markup is ${markup}%.

You MUST solve the following daily problems and return a single, highly detailed, precise JSON object with exactly the keys below. No other text or markdown wrappers.

Keys to include:
- "woodQuantity": volume in m3, total board-feet, and exact number of standard boards needed.
- "materialEstimation": count of raw sheets/boards, detailed hardware accessories (soft-close hinges, drawer slides, connectors, pocket screws) and consumables (wood glue, sealer, sandpapers, varnish) with estimated prices.
- "costEstimation": itemized cost breakdown (material, hardware, labor, workspace overheads).
- "cuttingInstructions": step-by-step instructions on how to cut the parts list from the raw boards to maximize grain match and yield.
- "boardOptimization": visual ASCII representation of the raw board(s) showing where the cuts are located or a detailed description of layout coordinates.
- "wasteReductionTips": recommendations to reuse offcuts for aprons, dowels, or edge bands to reduce scrap.
- "woodTypeAnalysis": analysis of why the selected wood (${woodType}) is ideal or where it lacks, and suggest durable care methods.
- "projectDuration": estimated hours for: drafting/prep, cutting/joints, assembly, finishing, installation.
- "quotationItems": list of line items (e.g., Raw Material, Hardware accessories, Master Artisan Labor, Protective coatings, VAT 19%), each with "description" (string), "quantity" (number), "price" (number), and "total" (number).
- "sellingPriceRecommendation": full breakdown of base cost, markup amount, final recommended selling price, profit margin, ROI, and markup ratio.
- "projectRisks": structural risks (e.g. cupping, sagging shelves, joints failing under load, moisture expansion/contraction).
- "cheaperAlternatives": cost-reduction suggestions (e.g. substituting MDF veneer, reducing thicknesses, using dowels instead of dominoes).
- "safetyRecommendations": list of safety precautions (PPE, sawdust extraction, blade guards, respirator for coatings).
- "toolRecommendations": precise list of hand and power tools (e.g., Japanese hand saws, track saw, wood chisels, domino jointer, pocket hole jig, router).
- "dailyWorkPlan": detailed step-by-step 5-day workshop timeline.
- "profitAnalysis": financial summary showing Net Profit and return on effort.

IMPORTANT: The requested language is: ${language}.
${isArabic ? `You MUST generate all text fields in natural, friendly, and authentic Algerian Arabic dialect (Darja / \u0627\u0644\u062F\u0627\u0631\u062C\u0629 \u0627\u0644\u062C\u0632\u0627\u0626\u0631\u064A\u0629) combined with professional woodworking terms so Algerian carpenters feel completely at home. Use popular jargon like "\u0627\u0644\u0634\u0627\u0646\u0637\u064A", "\u0627\u0644\u0633\u0644\u0639\u0629", "\u0627\u0644\u062F\u0631\u0627\u0647\u0645", "\u0627\u0644\u0641\u064A\u0637\u0648\u0631\u0629", "\u0644\u0648\u062D", "\u0643\u0648\u0646\u062A \u0627\u0644\u0628\u0644\u0627\u0643\u064A", "\u0627\u0644\u0635\u0628\u064A\u063A\u0629", "\u0627\u0644\u0645\u0639\u0644\u0645 \u0645\u0627\u0644\u0643", "\u0627\u0644\u062E\u062F\u0627\u0645\u064A\u0646".` : ""}
${isFrench ? `You MUST generate all text fields in professional French language used in master woodworking ateliers.` : ""}
`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const resultText = response.text || "{}";
    const parsedResult = JSON.parse(resultText.trim());
    res.json({ result: parsedResult, plan: parsedResult });
  } catch (error) {
    console.error("Carpenter Planner Error:", error);
    res.status(500).json({ error: error.message || "Error executing carpenter planner request" });
  }
});
app.post("/api/gemini/scan", async (req, res) => {
  try {
    let { imageBase64, imageUrl, category, language } = req.body;
    if (!imageBase64 && imageUrl) {
      imageBase64 = await fetchImageAsBase64(imageUrl);
    }
    if (!imageBase64) {
      return res.status(400).json({ error: "Image base64 data or imageUrl is required" });
    }
    const isArabic = language === "ar" || req.body.language === "ar";
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      const offlineEstimate = {
        dimensions: {
          width: "3.8m",
          height: "2.7m",
          depth: "0.6m"
        },
        materials: isArabic ? [
          { name: "\u062D\u0637\u0628 \u0627\u0644\u062C\u0648\u0632 \u0627\u0644\u0641\u0627\u062E\u0631 (American Walnut)", quantity: "0.8 \u06453" },
          { name: "\u0623\u0644\u0648\u0627\u062D MDF \u0645\u064F\u0645\u062A\u0627\u0632\u0629 (18 \u0645\u0645)", quantity: "24 \u0644\u0648\u062D" },
          { name: "\u0623\u0644\u0648\u0627\u062D \u0643\u0648\u0646\u062A \u0627\u0644\u0628\u0644\u0627\u0643\u064A \u0627\u0644\u0633\u0646\u062F\u064A\u0627\u0646 (Oak Plywood)", quantity: "12 \u0644\u0648\u062D" },
          { name: "\u0635\u0628\u064A\u063A\u0629 \u0648\u0641\u064A\u0631\u0646\u064A \u0644\u0627\u0645\u0639 (Lacquers)", quantity: "15 \u0644\u062A\u0631" },
          { name: "\u0645\u0641\u0635\u0644\u0627\u062A \u0628\u064A\u0628\u0627\u0646 \u062A\u0628\u0644\u0639 \u0648\u062D\u062F\u0647\u0627 (Soft-Close)", quantity: "36 \u062D\u0628\u0629" },
          { name: "\u0645\u0633\u0627\u0645\u064A\u0631 \u0648\u0628\u0631\u0627\u063A\u064A \u0644\u064A\u0646\u0648\u0643\u0633 (Screws)", quantity: "800 \u062D\u0628\u0629" }
        ] : [
          { name: "American Walnut Solid Wood", quantity: "0.8 m3" },
          { name: "MDF Premium 18mm Sheets", quantity: "24 sheets" },
          { name: "Oak Plywood Veneer Sheets", quantity: "12 sheets" },
          { name: "Matte Finishing Lacquer", quantity: "15 liters" },
          { name: "Soft-Close Cabinet Hinges", quantity: "36 pcs" },
          { name: "Stainless Steel Assembly Screws", quantity: "800 pcs" }
        ],
        estimatedCost: 18400,
        summary: isArabic ? "\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0631\u0627\u062F\u0627\u0631 \u0644\u0644\u0634\u0645\u0628\u0631\u0629 \u0639\u0637\u0627\u0646\u0627 \u062D\u064A\u0637 \u0637\u0648\u0644\u0647 3.8\u0645 \u0645\u0646\u0627\u0633\u0628 \u0628\u0632\u0627\u0641 \u0644\u062A\u0631\u0643\u064A\u0628 \u0627\u0644\u062E\u0632\u0627\u0626\u0646 \u0627\u0644\u0645\u062E\u0635\u0635\u0629 (Placards). \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A \u062A\u0631\u0643\u0632 \u0639\u0644\u0649 \u0627\u0633\u062A\u0639\u0645\u0627\u0644 \u0623\u0644\u0648\u0627\u062D MDF \u0645\u0639 \u0643\u0627\u062F\u0631 \u0635\u0644\u0628 \u0645\u0646 \u062D\u0637\u0628 \u0627\u0644\u062C\u0648\u0632 \u0627\u0644\u0623\u0635\u0644\u064A (Walnut) \u0628\u0627\u0634 \u0627\u0644\u062E\u062F\u0645\u0629 \u062A\u062C\u064A \u0648\u0627\u0642\u0641\u0629 \u0648\u0635\u062D\u064A\u062D\u0629 \u0648\u0646\u0646\u0635\u062D\u0648 \u0628\u062F\u064A\u0631 \u0631\u064A\u063A\u0644\u0627\u062C \u0644\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0623\u0631\u0636\u064A\u0629 \u062C\u0647\u0629 \u0627\u0644\u0628\u0627\u0628." : `AI Space Scanning successfully captured a 3.8m wall span suitable for a bespoke carpentry installation. Calculated material requirements focus heavily on MDF core optimization with a luxury Walnut solid fascia.`
      };
      return res.json({ result: offlineEstimate, report: offlineEstimate });
    }
    const ai = getGeminiClient();
    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64
      }
    };
    const textPart = {
      text: `You are the AI Spatial Intelligence scanner for "Malik Carpenter Pro". 
      Analyze this camera snapshot of a room or workspace for a bespoke "${category || "kitchen/wardrobe"}" carpentry project.
      Estimate the actual spatial dimensions of the space, walls, doors, or windows visible.
      Calculate the required quantity of materials to build a premium bespoke unit suitable for this space (estimate dimensions, wood quantity in m3, MDF, plywood in sheets, paint/varnish in liters, screws, hinges, and handles count).
      Provide estimates of labor hours, production days, installation days, base material costs, and a recommended selling price.
      Provide a visual/ASCII-style floor plan layout.
      
      You MUST respond with a single, highly accurate JSON object that fits the following interface:
      {
        "dimensions": { "width": "string with unit", "height": "string with unit", "depth": "string with unit" },
        "materials": [ { "name": "string material name", "quantity": "string quantity with unit" } ],
        "estimatedCost": number (currency in USD or equivalent value),
        "summary": "string executive summary of the project blueprint and recommendations"
      }
      
      ${isArabic ? `IMPORTANT: The requested language is Arabic (ar). You MUST generate all text fields (including 'name' of materials, and 'summary') in natural, friendly, and authentic Algerian Arabic dialect (Darja / \u0627\u0644\u062F\u0627\u0631\u062C\u0629 \u0627\u0644\u062C\u0632\u0627\u0626\u0631\u064A\u0629) combined with professional woodworking terms so Algerian carpenters feel completely at home. Keep numbers and technical dimensions precise. For example, use words like '\u0627\u0644\u0634\u0627\u0646\u0637\u064A', '\u0627\u0644\u0633\u0644\u0639\u0629', '\u0627\u0644\u062F\u0631\u0627\u0647\u0645', '\u0627\u0644\u0641\u064A\u0637\u0648\u0631\u0629', '\u0644\u0648\u062D', '\u0643\u0648\u0646\u062A \u0627\u0644\u0628\u0644\u0627\u0643\u064A', '\u0627\u0644\u0635\u0628\u064A\u063A\u0629'.` : ""}
      
      Do not include any other markdown or text wrappers. Return ONLY the raw JSON object.`
    };
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json"
      }
    });
    const resultText = response.text || "{}";
    const parsedResult = JSON.parse(resultText.trim());
    res.json({ result: parsedResult, report: parsedResult });
  } catch (error) {
    console.error("Scanner Error:", error);
    res.status(500).json({ error: error.message || "Error processing spatial scan" });
  }
});
async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Malik Carpenter Pro server booted successfully on port ${PORT}`);
  });
}
initializeServer();
//# sourceMappingURL=server.cjs.map
