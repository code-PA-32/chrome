import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { Iframe } from "./iframe";
import { ErrorMessage } from "./error-message";
import {
  getEmailByID,
  getChatID,
  getMetaData,
  encryptedAndEncodeURLKey,
  getFUBBootstrapData,
} from "./helpers";
import { OutOf } from "./out-of";

const appContainer = document.getElementById("app");
const IframeData = () => {
  const [iframeContent, setIframeContent] = useState(null);

  useEffect(() => {
    chrome.storage.local.get(["currentUrl"]).then(async (result): Promise<void> => {
      const url: URL = new URL(result.currentUrl);
      const baseUrl: string = url.origin + url.pathname;
      const pathNames: string[] = url.pathname.split("/") ?? [];
      const id: string = pathNames[pathNames.length - 1] ?? "";

      if (baseUrl.includes("https://www.findbusinesses4sale.com/listing") || baseUrl.includes("https://www.findbusinesses4sale.com/commercial-listing")) {
        const metaData: { listingMls: string, userEmail: string, listingId: string } = await getMetaData();
        if (metaData.userEmail === "N/A") {
          setIframeContent(
            <ErrorMessage
              padding="0 25px"
              err="You are not logged in."
              err2="Please sign in to findbusinesses4sale.com to view detailed information about this listing."
              link="https://www.findbusinesses4sale.com/login/"/>
          );
          console.info("An error occurred while getting data from metaData or user is not logged in, case: listing, commercial-listing");
          return;
        }
        const encrypted_emailFBS: string = encryptedAndEncodeURLKey(metaData.userEmail)

        if (metaData.listingMls === "N/A") {
          const profile_ikey: string = encryptedAndEncodeURLKey(metaData.listingId)
          setIframeContent(
            <Iframe
              url={`https://findbusinesses4sale.retool.com/embedded/public/74e99d98-a3b8-4cf2-b901-6cac17f48bcf?access_level_key=${encrypted_emailFBS}&profile_ikey=${profile_ikey}`}/>
          );
          console.info("An error occurred while getting data from metaData, case: listing, commercial-listing");
          return;
        }

        const encrypted_profile_keyFBS: string = encryptedAndEncodeURLKey(metaData.listingMls)

        setIframeContent(
          <Iframe
            url={`https://findbusinesses4sale.retool.com/embedded/public/74e99d98-a3b8-4cf2-b901-6cac17f48bcf?access_level_key=${encrypted_emailFBS}&profile_key=${encrypted_profile_keyFBS}`}/>
        );
        return;
      } else if (baseUrl.includes("https://www.findbusinesses4sale.com/broker-dashboard/")) {
        const metaData: { userEmail: string } = await getMetaData();
        if (metaData.userEmail === "N/A") {
          setIframeContent(
            <ErrorMessage
              padding="0 35px"
              err="You are not logged in."
              err2="Please sign in to findbusinesses4sale.com to view detailed information about your profile."
              link="https://www.findbusinesses4sale.com/login/"/>
          );
          console.info("An error occurred while getting data from metaData or user is not logged in, case: broker-dashboard");
          return;
        }

        const encrypted_emailBRK: string = encryptedAndEncodeURLKey(metaData.userEmail)
        setIframeContent(
          <Iframe
            url={`https://findbusinesses4sale.retool.com/embedded/public/cf559bd3-933a-4a04-9687-3ebaa3e0570f?access_level_key=${encrypted_emailBRK}`}/>
        );
        return;
      } else if (baseUrl.includes("https://findbusinessesforsale.pipedrive.com/deal")) {

        const userEmail: string = await getEmailByID(id);
        if (!userEmail) {
          setIframeContent(
            <ErrorMessage
              email="Write an Email"
              err="This Buyer does not have an Email address." err2="Please inform the Developers (see button)."
              link="mailto:oleg.lysytskyi@actse.ltd?subject=Buyer%20does%20not%20have%20Email"/>
          );
          console.info("An error occurred while getting data from Pipedrive, case: deal");
          return;
        }
        const encrypted_emailPD: string = encryptedAndEncodeURLKey(userEmail)
        setIframeContent(
          <Iframe
            url={`https://findbusinesses4sale.retool.com/embedded/public/37827805-e6f2-49a6-a7a1-8577d0d4669a?retool_dashboard_public_key=467f8c24-2333-49fe-9de8-3f58b085939e&profile_ekey=${encrypted_emailPD}`}/>
        );
      } else if (baseUrl.includes("https://manojkukreja.followupboss.com/2/people/view")) {
        const base64: { customFB4SLeadID: string, id: number } = await getChatID(id)
        if (base64 === null) {
          setIframeContent(
            <ErrorMessage
              padding="0 40px"
              link2="https://www.findbusinesses4sale.com/broker-dashboard/inquiriesleads/all/"
              email="Write an Email"
              link="mailto:willow@findbusinesses4sale.ca?subject=Buyer%20does%20not%20have%20FB4S%20ID"
              err="This Buyer does not have an FB4S-ID #." err2="Please inform Administration."/>
          );
          console.info("An error occurred while getting data from FollowUpBoss");
          return;
        }
        const data: { chat_id: number } = JSON.parse(atob(base64.customFB4SLeadID))
        const encrypted_chat_id: string = encryptedAndEncodeURLKey(data.chat_id.toString())

        const currentUserEmail: string = await getFUBBootstrapData()
        const emailMatch = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
        const email = emailMatch.test(currentUserEmail)
        if (!email) {
          setIframeContent(
            <ErrorMessage
              padding="0 50px"
              err={currentUserEmail} reload={<span>Please <span
              style={{textDecoration: "underline"}}>reload the page</span>  and try again.</span>}
              err2={currentUserEmail}
              link2="https://www.findbusinesses4sale.com/broker-dashboard/inquiriesleads/all/"
            />
          );
          console.info("An error occurred while getting data from FollowUpBoss");
          return;
        }
        const encrypted_current_user_emailFUB: string = encryptedAndEncodeURLKey
        (currentUserEmail)
        setIframeContent(
          <Iframe
            url={`https://findbusinesses4sale.retool.com/embedded/public/37827805-e6f2-49a6-a7a1-8577d0d4669a?access_level_key=${encrypted_current_user_emailFUB}&profile_ikey=${encrypted_chat_id}`}/>
        );
        return;
      } else {
        setIframeContent(
          <OutOf/>
        )
        console.info("This page is out of ecosystem");
        return;
      }
    });
  }, []);
  return iframeContent;
}


ReactDOM.createRoot(appContainer).render(<IframeData/>);
