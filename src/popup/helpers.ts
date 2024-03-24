import cryptoJS from "crypto-js";

export const getMetaData = async (): Promise<{ listingMls: string, userEmail: string, listingId: string }> => {
  const data = await chrome.storage.local.get(["metaData"]);
  return data.metaData
};

export const getFUBBootstrapData = async (): Promise<string | null> => {
  const data = await chrome.storage.local.get(["scriptList"]).then((res) => res.scriptList)
  if (!data) {
    console.info('Script not found');
    return 'Script not found from storage (Data)';
  }
  const script = data && data.find((s: {
    innerText: string;
  }) => s.innerText.includes("FUBBootstrapData"))
  if (!script) {
    return 'FUBBootstrapData not found in script array (Script)';
  }
  if (script) {
    const emailMatch = /"email"\s*:\s*"([^"]+)"/;
    const emailContent: string = script.innerText.match(emailMatch);
    if (emailContent) {
      return emailContent[1];
    } else {
      console.info('Email not found');
      return "Email not found in FUBBootstrapData (Inside Script)";
    }
  }
  return 'End of function';
};
export const getEmailByID = async (id: string): Promise<string> => {
  if (!id) return;
  try {
    const response = await fetch(
      `https://api.pipedrive.com/v1/deals/${id}?api_token=3bfa120858adfd568037072d7e75886d7f10e4c5`
    );
    const res = await response.json();
    const url = new URL(res.data["d11fae2f25edbec3ee6f6b954fc5bcbc79b04baf"])
    return url.searchParams.get("email_value")
  } catch (e) {
    console.info(e)
  }
};

const options: { method: string, headers: { accept: string, Authorization: string } } = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Basic ${btoa("fka_07EXxVqqM3qQR2Zp74Ll35Oi5J9glTgQ9I")}`,
  },
};
export const getChatID = async (id: string): Promise<{ customFB4SLeadID: string, id: number } | null> => {
  if (!id) return;
  try {
    const res = await fetch(
      `https://api.followupboss.com/v1/people/${id}?fields=customFB4SLeadID`,
      options
    );
    const data = await res.json();
    if (data.customFB4SLeadID) return data;
    return null;
  } catch (e) {
    console.info(e)
  }
};

export const encryptedAndEncodeURLKey = (data: string): string => {
  const encryptedData = cryptoJS.AES.encrypt(data, "FB4S").toString();
  return encodeURIComponent(encryptedData)
}