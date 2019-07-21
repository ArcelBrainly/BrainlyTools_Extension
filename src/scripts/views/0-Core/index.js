"use strict";

window.performanceStartTiming = performance.now();

import notification from "../../components/notification";
import PrepareDeleteReasons from "../../controllers/PrepareDeleteReasons";
import ServerReq from "../../controllers/Req/Server";
import _System from "../../controllers/System";
import storage from "../../helpers/extStorage";
import InjectToDOM from "../../helpers/InjectToDOM";
import messagesLayoutExtender from "../../helpers/messagesLayoutExtender";
import "../../helpers/preventConsolePreventer";
import WaitForObject from "../../helpers/WaitForObject";
import renderAnnouncements from "./_/Announcements";
import fetchFriends from "./_/fetchFriends";
//import renderChatPanel from "./_/ChatPanel";
import RenderMenuButtonFixer from "./_/MenuButtonFixer";
import ModerationPanel from "./_/ModerationPanel";
import SetBrainlyData from "./_/SetBrainlyData";
import SetMetaData from "./_/SetMetaData";
import SetUserData from "./_/SetUserData";

/**
 * @type {_System}
 */
let System;
window.selectors = {
  toplayerContainer: "body > div.js-page-wrapper"
}

window.addEventListener("beforeunload", () => {
  if (window.System && window.isPageProcessing) {
    let message = window.System.data.locale.common.notificationMessages.ongoingProcess;

    if (typeof window.isPageProcessing == "string") {
      message = window.isPageProcessing;
    }

    event.preventDefault();
    event.returnValue = message;
  }
});

class Core {
  constructor() {
    System = new _System(this);
    window.System = System;

    this.Pipeline();
  }
  async Pipeline() {
    await SetMetaData();

    this.userData = await SetUserData();
    this.UserDataLoaded();

    await SetBrainlyData();

    await this.SetMarketConfig();
    await this.PrepareLanguageData();

    await System.ShareSystemDataToBackground();

    await new ServerReq().SetAuthData();
    await this.CheckForNewUpdate();

    this.InitNotifier();

    await WaitForObject("jQuery");
    System.Log("Jquery OK!");

    this.RenderEventCelebrating();
    this.LoadComponentsForAllPages();
    this.InjectFilesToPage();
    this.InjectFilesToPageAfter_FriendsListLoaded();
    this.InjectFilesToPageAfter_DeleteReasonsLoaded();
  }
  UserDataLoaded() {
    window.postMessage({ action: "changeColors", data: this.userData.themeColor || "#57b2f8" }, "*");
    messagesLayoutExtender(this.userData.extendMessagesLayout || typeof this.userData.extendMessagesLayout == "undefined");
  }
  async SetMarketConfig() {
    System.data.config.marketConfig = await InjectToDOM(`/configs/${location.hostname}.json`);

    return Promise.resolve();
  }
  async PrepareLanguageData() {
    let language = await storage("get", "language");

    if (!language) {
      language = System.data.Brainly.defaultConfig.locale.LANGUAGE;

      if (!language) {
        throw new Error("Language cannot be saved in storage. This is probably a defaultConfig error");
      }

      storage("set", { language });
    }

    System.data.locale = await System.prepareLangFile(language);
    System.Log("Locale inject OK!");

    return Promise.resolve();
  }
  CheckForNewUpdate() {
    return new Promise((resolve, reject) => {
      if (System.data.Brainly.userData.extension.newUpdate) {
        System.updateExtension();
        notification(System.data.locale.core.notificationMessages.updateNeeded, "info", true);
        reject(System.data.locale.core.notificationMessages.updateNeeded);
      } else {
        resolve();
      }
    });
  }
  async InitNotifier() {
    let notifier = await storage("get", "notifier");

    System.toBackground("notifierInit", notifier);
  }
  async RenderEventCelebrating() {
    /*let _date = new Date();
    if (_date.getMonth() == 9 && _date.getDate() == 31) {
    	renderHalloween();
    }*/
    /* await InjectToDOM("/scripts/lib/snowstorm.min.js");
    await WaitForObject("snowStorm");
    snowStorm.snowColor = '#57b2f8';
    snowStorm.flakesMaxActive = 32;
    snowStorm.excludeMobile = false; */
  }
  LoadComponentsForAllPages() {
    new ModerationPanel();
    renderAnnouncements();
    //renderChatPanel();
    RenderMenuButtonFixer();

    //document.documentElement.setAttribute("extension", System.data.meta.manifest.version);
    window.sitePassedParams && typeof window.sitePassedParams == "string" && (window.sitePassedParams = JSON.parse(sitePassedParams));
  }
  InjectFilesToPage() {
    if (System.checkRoute(2, "view_user_warns")) {
      InjectToDOM([
        "/scripts/views/7-UserWarnings/index.js",
        "/styles/pages/UserWarnings.css"
      ]);
    }

    if (System.checkRoute(2, "supervisors")) {
      InjectToDOM([
        "/scripts/views/8-Supervisors/index.js",
        "/styles/pages/Supervisors.css"
      ]);
    }

    if (System.checkRoute(2, "uploader")) {
      InjectToDOM([
        "/scripts/views/9-Uploader/index.js",
        "/styles/pages/Uploader.css"
      ]);
    }

    if (System.checkRoute(2, "view_moderator")) {
      InjectToDOM([
        "/scripts/views/11-ModeratorActionsHistory/index.js",
        "/styles/pages/ModeratorActionsHistory.css"
      ]);
    }
    /* if (System.checkRoute(2, "holidays_show")) {
      InjectToDOM([
        "/scripts/views/Holidays/index.js",
        //"/styles/pages/ModeratorActionsHistory.css"
      ]);
    } */
  }
  async InjectFilesToPageAfter_FriendsListLoaded() {
    await fetchFriends();
    System.Log("Fetching friends OK!");

    if (System.checkRoute(1, "messages")) {
      InjectToDOM([
        "/scripts/lib/jquery-observe-2.0.3.min.js",
        "/scripts/lib/jquery-ui.min.js",
        "/scripts/views/2-Messages/index.js",
        "/styles/pages/Messages.css"
      ]);
    }

    if (
      System.checkRoute(1, "user_profile") ||
      (
        System.checkRoute(1, "users") &&
        System.checkRoute(2, "view")
      )
    ) {
      InjectToDOM([
        "/scripts/views/5-UserProfile/index.js",
        "/styles/pages/UserProfile.css"
      ]);
    }
  }
  async InjectFilesToPageAfter_DeleteReasonsLoaded() {
    await PrepareDeleteReasons();
    System.Log("Delete reasons OK!");

    if (System.checkRoute(1, "") || System.checkRoute(1, "task_subject_dynamic")) {
      InjectToDOM([
        "/scripts/lib/jquery-observe-2.0.3.min.js",
        "/scripts/views/1-Home/index.js",
        "/styles/pages/Home.css"
      ])
    }

    if (System.checkRoute(1, "task_view")) {
      InjectToDOM([
        "/scripts/lib/jquery-observe-2.0.3.min.js",
        "/scripts/views/3-Task/index.js",
        "/styles/pages/Task.css"
      ])
    }

    if (System.checkRoute(2, "user_content")) {
      InjectToDOM([
        "/scripts/views/4-UserContent/index.js",
        "/styles/pages/UserContent.css"
      ])
    }

    if (System.checkRoute(2, "archive_mod")) {
      InjectToDOM([
        "/scripts/lib/jquery-observe-2.0.3.min.js",
        "/scripts/views/6-ArchiveMod/index.js",
        "/styles/pages/ArchiveMod.css"
      ])
    }

    if (System.checkRoute(1, "app") && System.checkRoute(2, "ask")) {
      InjectToDOM([
        "/scripts/lib/jquery-observe-2.0.3.min.js",
        "/scripts/views/10-QuestionSearch/index.js",
        "/styles/pages/QuestionSearch.css"
      ])
    }
  }
}
new Core();
