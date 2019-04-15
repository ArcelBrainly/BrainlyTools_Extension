"use strict";

import Request from "./Request";
import fillRange from "../helpers/fillRange";

const coupon = () => btoa(`[object Object]${System.data.Brainly.userData.user.id}-${new Date().getTime()}-${Math.floor(1 + Math.random() * 99999999)}`);

/**
 * Get actions details of a question
 * @param {number|string} questionId - Id number of a question
 */
export function GetQuestionContent(questionId) {
  if (!(questionId > 0)) return Promise.reject("Unvalid question id");

  return Request.BrainlyAPI("GET", `/api_tasks/main_view/${questionId}`);
}
/**
 * Delete question by id
 * @param {object} data - Post data
 */
export function RemoveQuestion(data) {
  data = {
    "model_type_id": 1,
    "give_warning": false,
    "take_points": true,
    "return_points": true,
    ...data
  }
  data.reason += ` ${System.constants.config.reasonSign}`;

  return Request.BrainlyAPI("POST", '/moderation_new/delete_task_content', data);
}
/**
 * Delete answer by id
 * @param {object} data - Post data
 */
export function RemoveAnswer(data) {
  data = {
    model_type_id: 2,
    give_warning: false,
    take_points: true,
    schema: "moderation.response.delete.req",
    ...data
  }
  data.reason += ` ${System.constants.config.reasonSign}`;

  return Request.BrainlyAPI("POST", '/moderation_new/delete_response_content', data);
}
/**
 * Delete comment by id
 * @param {object} data - Post data
 */
export function RemoveComment(data) {
  data = {
    "model_type_id": 45,
    ...data
  }

  if (!data.give_warning) {
    data.give_warning = false
  }

  data.reason += ` ${System.constants.config.reasonSign}`;

  return Request.BrainlyAPI("POST", '/moderation_new/delete_comment_content', data);
}
/**
 * Confirm question by id
 * @param {number} model_id
 */
export function ConfirmQuestion(model_id) {
  return ConfirmContent(model_id, 1);
}
/**
 * Confirm answer by id
 * @param {number} model_id
 */
export function ConfirmAnswer(model_id) {
  return ConfirmContent(model_id, 2);
}
/**
 * Confirm comment by id
 * @param {number} model_id
 */
export function ConfirmComment(model_id) {
  return ConfirmContent(model_id, 45);
}
export function ConfirmContent(model_id, model_type_id) {
  let data = {
    model_id,
    model_type_id,
    schema: "moderation.content.ok"
  };

  return Request.BrainlyAPI("POST", '/moderation_new/accept', data);
}
/**
 * Approve answer by id
 * @param {number} model_id - answer id
 */
export function ApproveAnswer(model_id) {
  let data = {
    model_type: 2,
    model_id,
    _coupon_: coupon()
  }

  return Request.BrainlyAPI("POST", '/api_content_quality/confirm', data);
}
/**
 * Unapprove answer by id
 * @param {number} model_id - answer id
 */
export function UnapproveAnswer(model_id) {
  let data = {
    model_type: 2,
    model_id,
    _coupon_: coupon()
  }

  return Request.BrainlyAPI("POST", '/api_content_quality/unconfirm', data);
}
/**
 * Delete answer by id
 * @param {object} data - Post data
 */
export function ReportForCorrection(data) {
  data = {
    model_type_id: 2,
    schema: "",
    ...data
  }
  data.reason += ` ${System.constants.config.reasonSign}`;

  return Request.BrainlyAPI("POST", '/moderation_new/wrong_report', data);
}
/**
 * Create a ticket for a question
 * @param {number|string} taskId - Id number of a question
 * @param {boolean} withTaskDetails - If you want to get the actions list of a question then pass "true"
 */
export function OpenModerationTicket(taskId, withTaskDetails = false) {
  return new Promise((resolve, reject) => {
    let data = {
      model_id: taskId,
      model_type_id: 1,
      schema: "moderation.content.result.res"
    }

    let getContentPromise = Request.BrainlyAPI("POST", '/moderation_new/get_content', data);

    getContentPromise
      .then(async resTask => {
        if (!withTaskDetails) {
          resolve(resTask)
        } else {
          if (resTask.success) {
            let resActions = await TaskActions(taskId);

            if (resActions.success) {
              resolve({
                ...resTask,
                actions: resActions
              })
            }
          }

        }
      })
      .catch(reject);
  });
}

/**
 * Get actions details of a question
 * @param {number|string} questionId - Id number of a question
 */
export function TaskActions(questionId) {
  return Request.BrainlyAPI("GET", `/api_task_lines/big/${questionId}`);
}
/**
 * Close a opened ticket for a question
 * @param {number|string} taskId - Id number of a question
 */
export function CloseModerationTicket(taskId) {
  let data = {
    model_id: taskId,
    model_type_id: 1,
    schema: ""
  }

  return Request.BrainlyAPI("POST", '/moderate_tickets/expire', data);
}

/**
 * Get user profile data by user id
 * @param {number} id - User id
 */
export function GetUserByID(id) {
  return Request.BrainlyAPI("GET", `/api_user_profiles/get_by_id/${~~id}`);
}

/**
 * Get users profile data by user ids
 * @param {number[]} ids - User id numbers
 */
export function GetUsersByID(ids) {
  return Request.BrainlyAPI("GET", `/api_users/get_by_id?id[]=${ids.join("&id[]=")}`);
}

/**
 * Get user profile data by user id. Difference between GetUserByID and GetUserByID2 is GetUserByID serving bio text and returns false for deleted accounts. But GetUserByID2 returns true for deleted accounts but not bio text. Therefore, should be two different method to get user details.
 * @param {number} id - User id
 */
export function GetUserByID2(id) {
  return Request.BrainlyAPI("GET", `/api_users/get/${~~id}`);
}

/**
 * Cancel user warning by warning id
 * @param {number|string|Object} data - Warning id or id's in array. Example: { userID: 1183068, warningIDs: [5016271, 5016272] }
 */
export function CancelWarning(data) {
  let userID = null;

  if (window.sitePassedParams) {
    userID = sitePassedParams[0];
  }

  if (typeof data === "string" || typeof data == "number") {
    data = {
      userID,
      warningIDs: [data]
    };
  } else if (Object.prototype.toString.call(data) === "[object Array]") {
    data = {
      userID,
      warningIDs: data
    }
  }

  data.warningIDs.forEach(id => {
    Request.BrainlySaltGet(`/moderators/cancel_warning/${data.userID}/${id}`);
  });
}

export function getAllFriends() {
  return new Promise((resolve, reject) => {
    $.getJSON(`//${location.hostname}/buddies_new/ajax_panel_get_buddies`, resolve).fail(reject);
  });
}

export function RemoveFriend(idList) {
  return Request.BrainlySaltFetch(`/buddies_new/unbuddy/${idList}`);
}
export function RemoveAllFriends(each) {
  let idList = System.friends.map(friend => friend.id);

  return RemoveFriends(idList, each);
}
/**
 * @param {number[]|string[]} idList
 * @param {function} each - Each callback
 */
export function RemoveFriends(idList, each) {
  return new Promise((resolve, reject) => {
    if (!idList || (idList instanceof Array && idList.length == 0)) {
      return reject("No friend found");
    } else {
      let count = 0;
      let profileLink = System.createProfileLink();

      idList.forEach(async (id) => {
        let requestPromise = await RemoveFriend(id);
        count++;

        if (
          each &&
          requestPromise &&
          requestPromise.url &&
          (
            requestPromise.url.indexOf("/users/view") >= 0 ||
            requestPromise.url.indexOf(profileLink) >= 0
          )
        ) {
          each(count, id);
        }

        if (count == idList.length)
          resolve();
      });
    }
  });
}

export function findUser(nick) {
  return Request.get(`/users/search/${nick}`);
}

export function GetAllModerators(idList, handlers) {
  return new Promise(async (resolve, reject) => {
    if (Object.prototype.toString.call(idList) == "[object Object]") {
      handlers = idList;
      idList = null;
    }

    let prepareUsers = async _idList => {
      let userRes = await GetUsersByID(_idList);

      if (userRes && userRes.success) {
        System.allModerators = {
          list: userRes.data,
          withNicks: {},
          withID: {},
          withRanks: {}
        };

        if (userRes.data && userRes.data.length > 0) {
          userRes.data.forEach(user => {
            System.allModerators.withNicks[user.nick] = user;
            System.allModerators.withID[user.id] = user;

            if (typeof handlers == "object" && handlers.each) {
              handlers.each(user);
            }

            if (user.ranks_ids && user.ranks_ids.length > 0) {
              user.ranks_ids.forEach(rank => {
                let currentRank = System.allModerators.withRanks[rank];

                if (!currentRank) {
                  currentRank = System.allModerators.withRanks[rank] = []
                }

                currentRank.push(user);
              });
            }
          });
        }

        resolve();
      }
    }

    if (idList) {
      prepareUsers(idList);
    } else {
      let res = await Request.get(`/moderators/supervisors/${System.data.Brainly.userData.user.id}`);

      if (res) {
        idList = res.match(/\=\d{1,}/gim);

        if (idList && idList.length > 0) {
          if (typeof idList[0] == "string") {
            idList = idList.map(id => ~~(id.replace(/\D/gim, "")));
          }

          prepareUsers(idList);
        }
      }
    }
  });
}

export function getMessageID(user_id) {
  return Request.BrainlyAPI("POST", `/api_messages/check`, { user_id });
}

export function sendMessage(conversation_id, content) {
  let data = {
    content,
    conversation_id
  };
  //onError yerine function aç ve gelen isteğe göre conversation id oluştur. İstek conversation id hatası değilse on error devam ettir
  return Request.BrainlyAPI("POST", `/api_messages/send`, data);
}

/* export function sendMessages(conversation_ids, content, callbacks, onError) {
	let isNumberRange = (typeof conversation_ids == "string" && conversation_ids.indexOf(":") >= 0);

	if (isNumberRange) {
		let range = conversation_ids.split(":");
		conversation_ids = fillRange(...range);
	}

	let openedRequests = 0;
	let currentUserIndex = 0;
	let membersLen = conversation_ids.length;
	let sendedMessagesCounter = 0;

	let onResponseHandler = res => {
		openedRequests--;
		sendedMessagesCounter++;

		if (res && res.success) {
			callbacks.each(sendedMessagesCounter, openedRequests);
		}

		if (sendedMessagesCounter == membersLen) {
			callbacks.done(conversation_ids);
		}
	};
	onError = err => {
		console.log(err);
	}

	let _loop_sendMessage = setInterval(() => {
		if (currentUserIndex == membersLen) {
			clearInterval(_loop_sendMessage);

			return true;
		}

		//if (openedRequests < 500) {
		openedRequests++;
		let user = conversation_ids[currentUserIndex++];
		if (!(user.conversation_id || user.conversationID)) {
			(async () => {
				let resConversation = await getMessageID(user.id || user);
				if (resConversation && resConversation.success) {
					if (typeof user == "number") {
						user = { user_id: user }
					}

					user.conversation_id = resConversation.data.conversation_id;

					sendMessage(user.conversation_id, content, { success: onResponseHandler, error: onError, forceStop: callbacks.forceStop });
				} else {
					openedRequests--;
					sendedMessagesCounter++;

					callbacks.each(sendedMessagesCounter);
				}
			})();
		} else {
			sendMessage(user.conversation_id || user.conversationID, content, { success: onResponseHandler, error: onError, forceStop: callbacks.forceStop });
		}
		//}
	});

	return _loop_sendMessage;

} */
export class SendMessageToBrainlyIds {
  constructor(handlers = { EachBefore: () => {}, Each: () => {}, Done: () => {} }) {
    this.handlers = handlers;
    this.sendLimit = 0;
    this.activeConnections = 0;
  }
  /**
   * @param {string|number[]} idList
   * @param {string} content
   */
  Start(idList, content) {
    this.idList = this.FixIdList(idList).slice();
    this.processedIdList = [];
    this.content = content;

    this.StartSending();
  }
  /**
   * @param {string|number[]} idList
   * @returns {number[]}
   */
  FixIdList(idList) {
    if (typeof idList == "string" && idList.indexOf(":") >= 0) {
      let range = idList.split(":");
      idList = fillRange(...range);
    }

    return idList
  }
  StartSending() {
    this._loop = setInterval(this.TryToSend.bind(this));
    this._loop_resetLimit = setInterval(() => { this.sendLimit = 0 }, 1000);
  }
  TryToSend() {
    if (this.sendLimit < 4) {
      let user_id = this.idList.shift();

      if (!user_id)
        return this.Stop();

      this.sendLimit++;
      this.activeConnections++;

      this.Send(user_id);
    }
  }
  Stop() {
    clearInterval(this._loop);
    clearInterval(this._loop_resetLimit);
  }
  async Send(id) {
    let user = {
      id
    };

    this.handlers.EachBefore(user);

    try {
      let resConversation = await getMessageID(user.id);

      if (!resConversation || !resConversation.success) {
        user.exception_type = resConversation.exception_type;
      } else {
        user.conversation_id = resConversation.data.conversation_id;
        user.time = Date.now();

        this.processedIdList.push(user);

        let resSend = await sendMessage(user.conversation_id, this.content);
        //await System.TestDelay();	let resSend = { success: true }

        if (!resSend || !resSend.success) {
          user.exception_type = resSend.exception_type;

          if (resSend.validation_errors)
            user.validation_errors = resSend.validation_errors;
        }
      }
    } catch (error) {
      if (!user.exception_type)
        user.exception_type = 1;

      console.error(error);
    }

    this.HandleResponse(user);
  }
  HandleResponse(user) {
    this.activeConnections--;
    this.handlers.Each(user);

    if (
      this.activeConnections == 0 &&
      this.idList.length == 0
    )
      this.Finish();
  }
  Finish() {
    this.handlers.Done(this.processedIdList);
  }
}

export function sendMessageToBrainlyIds(idList, content, each) {
  return new Promise((resolve, reject) => {
    let isNumberRange = (typeof idList == "string" && idList.indexOf(":") >= 0);

    if (isNumberRange) {
      let range = idList.split(":");
      idList = fillRange(...range);
    }

    let tempIdList = [];
    let currentUserIndex = 0;
    let idListLen = idList.length;
    let sendedMessagesCount = 0;
    let onRequestCompleted = () => {
      each(++sendedMessagesCount);

      if (sendedMessagesCount == idListLen) {
        resolve(tempIdList);
      }
    }

    let _loop_sendMessage = setInterval(async () => {
      if (currentUserIndex == idListLen) {
        clearInterval(_loop_sendMessage);

        return true;
      }

      //if (openedRequests < 500) {
      //openedRequests++;
      let user = idList[currentUserIndex++];

      if (!user.time) {
        let brainlyID = user.id || user.brainlyID || user;
        let resConversation = await getMessageID(brainlyID);

        if (resConversation) {
          user = {
            brainlyID
          };

          if (resConversation.success) {
            user.conversation_id = resConversation.data.conversation_id;
            user.time = Date.now();
          } else {
            user.exception = resConversation.exception_type
          }
        }
      }

      tempIdList.push(user);

      (async () => {
        try {
          await sendMessage(user.conversation_id, content);
          onRequestCompleted();
        } catch (error) {
          console.log(error);
          onRequestCompleted();
        }
      })();

      //}
    });
  });
}

export function ChangeBio(content) {
  return Request.Brainly({
    method: "POST",
    path: `/graphql/${System.data.Brainly.defaultConfig.MARKET}?op=changeBio`,
    data: JSON.stringify({
      operationName: "changeBio",
      query: `mutation changeBio { updateUserDescription( token:"${System.data.Brainly.tokenLong}", input:{ description: "${content}"}){user{id}}}`,
      variables: {}
    })
  });
}

export function RemoveAllRanks(user_id, tokens) {
  return FormPost(
    "/ranks/delete_user_special_ranks",
    [{
      key: "data[uid]",
      value: user_id
    }], {
      tokens
    }
  );
}
export function GetPHPTokens(path, parentSelector) {
  return new Promise(async (resolve, reject) => {
    try {
      let HTML = await Request.BrainlySaltGet(path);
      let tokens = {
        key: /\[key]" value="(.*)" i/i,
        lock: /\[lock]" value="(.*)" i/i,
        fields: /\[fields]" value="(.*)" id="TokenF/i
      }

      if (parentSelector) {
        HTML = $(parentSelector, HTML).html();
      }

      $.each(tokens, (i, token) => {
        let tokenMatch = HTML.match(token);

        tokens[i] = tokenMatch ? tokenMatch[1] : "";
      });

      resolve(tokens);
    } catch (error) {
      reject(error);
    }
  });
}
export function AddRank(user_id, rank_id) {
  return FormPost(
    `/ranks/add_special_rank_to_user/${user_id}`,
    [{
      key: "data[Rank][type]",
      value: rank_id
    }], {
      tokenURL: `/ranks/choose_special_rank_for_user/${user_id}`
    }
  );
}
export function AddPoint(user_id, point) {
  return FormPost(
    `/admin/users/change_points/${user_id}`,
    [{
      key: "data[ChangePoints][diff]",
      value: point
    }], {
      tokenURL: System.createProfileLink("a", user_id, true),
      tokenFormSelector: "#ChangePointsAddForm"
    }
  );
}
export async function FormPost(path, data = [], { tokens, tokenURL, tokenFormSelector, onProgress, abort }) {
  let form = new FormData();

  if (tokenURL) {
    tokens = await GetPHPTokens(tokenURL, tokenFormSelector)
  }

  let { key = "", fields = "", lock = "" } = tokens;

  //form.append("_method", "POST");
  form.append("data[_Token][key]", key);
  form.append("data[_Token][fields]", fields);
  form.append("data[_Token][lock]", lock);

  if (data.length > 0) {
    data.forEach(element => {
      form.append(element.key, element.value);
    });
  }

  return Request.BrainlyFormPost(path, form, { onProgress, abort });
}

export function UploadFile(file, onProgress) {
  return FormPost(
    `/admin/uploader/add`,
    [{
      key: "data[Uploader][file]",
      value: file
    }], {
      tokenURL: "/admin/uploader/index",
      onProgress,
      abort: true
    }
  );
}

export function GetComments(model_id, type, amount) {
  return Request.BrainlyAPI("GET", `/api_comments/index/${model_id}/${type}/${amount}`);
}

export function GetReportedComments(last_id) {
  let data = {
    subject_id: 0,
    category_id: 998,
    schema: "moderation.index"
  }

  if (last_id) {
    data.last_id = last_id;
  }

  return Request.BrainlyAPI("POST", `/moderation_new/get_comments_content`, data);
}

export function GetReportedContents(last_id) {
  let data = {
    subject_id: 0,
    category_id: 0,
    schema: "moderation.index"
  }

  if (last_id) {
    data.last_id = last_id;
  }

  return Request.BrainlyAPI("POST", `/moderation_new/index`, data);
}

export function GetCorrectedContents(last_id) {
  let data = {
    subject_id: 0,
    category_id: 999,
    schema: "moderation.index"
  }

  if (last_id) {
    data.last_id = last_id;
  }

  return Request.BrainlyAPI("POST", `/moderation_new/get_wrong_content`, data);
}
