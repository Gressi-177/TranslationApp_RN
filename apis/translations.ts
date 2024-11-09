const API_URL = "http://192.168.1.2:8000/api/v1";

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
