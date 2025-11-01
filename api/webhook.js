// CommonJS 版（Vercelでそのまま動く）
const { Client } = require("@line/bot-sdk");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(200).send("OK");

  let body = {};
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
  } catch (e) {
    console.error("JSON parse error:", e);
  }
  const events = body.events || [];

  const client = new Client({
    channelAccessToken: process.env.LINE_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
  });

  try {
    await Promise.all(
      events.map((ev) =>
        handleEvent(ev, client).catch((err) => {
          console.error("handleEvent error:", err);
        })
      )
    );
    return res.status(200).send("OK");
  } catch (e) {
    console.error("handler error:", e);
    // LINE 側の再試行ループを避けるため 200 を返す
    return res.status(200).send("OK");
  }
};

async function handleEvent(event, client) {
  if (event.type !== "message" || event.message.type !== "text") return;
  const text = (event.message.text || "").trim();

  if (/^(今日|献立|メニュー)/.test(text)) {
    return client.replyMessage(event.replyToken, {
      type: "text",
      text:
        "今日の献立🎯\n① 鶏むね丼\n② さば水煮丼\n③ 豆腐チゲ\n→「美容メニュー」「栄養ログ」も試してね！",
    });
  }
  if (/^(美容|ダイエット)/.test(text)) {
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "美容×ダイエット💖 高タンパク・低脂質の候補を出すよ（実装中）",
    });
  }
  if (/^(栄養|ログ)/.test(text)) {
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "栄養ログ📝『完食 / 半分 / スキップ』を送ってね（実装中）",
    });
  }

  return client.replyMessage(event.replyToken, {
    type: "text",
    text: "使い方：\n・「今日の献立」\n・「美容メニュー」\n・「栄養ログ」",
  });
}
