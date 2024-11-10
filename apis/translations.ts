const API_URL = "http://192.168.2.24:8000/api/v1";
const AI_API_KEY = "AIzaSyDmizljnUniKUh0WU62rn6oEdT176JQ6Mc";
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

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
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
