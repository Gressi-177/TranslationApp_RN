const API_URL = "http://192.168.70.23:8000/api/v1";
const AI_API_KEY = "AIzaSyA4-YkL4eoCKWNfYgQdyERDz8YgQph113A";
const AI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${AI_API_KEY}`;

export const postAudio = async (
  base64Data: string,
  language: string = "en"
) => {
  const jsonPayload = {
    audio: base64Data,
    language,
  };

  const response = await fetch(`${API_URL}/upload-audio`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(jsonPayload),
  });

  return response.json();
};

export const postImage = async (uri: string) => {
  const name = uri.split("/").pop() || "unknown";
  const extension = name.split(".").pop();

  const formData = new FormData();
  formData.append("file", {
    uri,
    name,
    type: `image/${extension}`,
  } as any);

  try {
    const response = await fetch(`${API_URL}/img2text`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });

    if (!response.ok) {
      console.error(
        `HTTP error! status: ${response.status}`,
        await response.text()
      );
    }

    return response.json();
  } catch (error) {
    console.error("Fetch error:", error);
  }
};

export const postQuestion = async (question: string) => {
  const response = await fetch(AI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: question,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const postImageNew = async (uri: string) => {
  const name = uri.split("/").pop() || "unknown";
  const extension = name.split(".").pop();

  const formData = new FormData();
  formData.append("file", {
    uri,
    name,
    type: `image/${extension}`,
  } as any);

  try {
    const response = await fetch(`${API_URL}/ocr`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });

    if (!response.ok) {
      console.error(
        `HTTP error! status: ${response.status}`,
        await response.text()
      );
    }

    return response.json();
  } catch (error) {
    console.error("Fetch error:", error);
  }
};
