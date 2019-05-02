import Action from "./";

const noop = () => {};

export default class SendMessageToBrainlyIds {
  constructor(handlers = { EachBefore: noop, Each: noop, Done: noop, Error: noop }) {
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
      let resConversation = await new Action().GetConversationID(user.id);

      if (!resConversation || !resConversation.success) {
        user.exception_type = resConversation.exception_type;
      } else {
        user.conversation_id = resConversation.data.conversation_id;
        user.time = Date.now();

        this.processedIdList.push(user);

        let resSend = await new Action().SendMessage(user.conversation_id, this.content);
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
  Promise() {
    this.promise = new Promise(resolve => (this.handlers.Done = resolve));

    return this.promise;
  }
}
