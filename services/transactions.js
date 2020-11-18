'use strict'

const async = require("async");
const inbox = require("inbox");
const keys = ["amount", "customer", "phone", "paymentDate", "description", "momoTransId"]

module.exports = {
  loadData: loadData
}

/* ====
  auth {user: 'email liên kết momo', pass: 'pass của email not momo'}
 */
function loadData(auth) {
  let client = getClient(auth);
  return new Promise((resolve, reject) => {
    getMessages(client)
      .then(messages => {
        // console.log('getMessages:', messages)
        let data = [];
        let errors = [];
        async.each(
          messages,
          (msg, next) => {
            // console.log('message', msg)
            getInboxContent(client, msg.UID)
              .then(info => {
                // console.log('getInboxContent end:', info)
                let arr = info.split(`<td align=3D"center" style=3D"background-color: white; padding-top: 15p=`);
                let string = arr[1];
                arr = string.split(`<td align=3D"center" style=3D"background-color: white; padding-top: 0; =`);
                string = arr[1];
                arr = string.split(`ne-height:22px;  font-weight: normal; font-size: 15px;">`);
                let obj = {};
                arr.map((str, index) => {
                  if (index) {
                    let length = str.indexOf("</div>");
                    let val = str.slice(0, length).trim();
                    if (index === 1) {
                      // amount
                      val = parseInt(val.replace(".", ""));
                    }
                    if (index === 4) {
                      // payment date
                      val = val.replace("- ", "");
                    }
                    obj[keys[index - 1]] = val
                  }
                })
                data.push(obj)
                next()
              })
              .catch(err => {
                console.log('getInboxContent err:', err)
                next(err)
              });
          },
          (err => {
            if (err) errors.push(err.message || err);
            if (errors.length) return reject(errors)
            return resolve(data)
          })
        )
      }).catch(err => {
      if (err) return reject(err)
      return resolve(null)
    });
  })
}

function getClient(auth) {
  let client = inbox.createConnection(false, "imap.gmail.com", {
    secureConnection: true,
    auth: auth
  });
  client.connect();
  return client
}

function getMessages(client) {
  return new Promise((resolve, reject) => {
    let data = [];
    client.on("connect", () => {
      // console.log("Successfully connected to server");
      client.openMailbox("INBOX", (error, info) => {
        if (error) reject(error);
        // console.log("Message count in INBOX: ", info.count);
        if (info.count > 0) {
          client.listMessages(-info.count, (err, messages) => {
            if (err) reject(err);
            messages.map(message => {
              if (message.from.address === "no-reply@momo.vn" && message.title.includes("Bạn vừa nhận được ti ền từ")) {
                data.push(message)
              }
            });
            resolve(data)
          });
        } else {
          resolve(data)
        }
      });
    });
  })
}

function getInboxContent(client, UID) {
  return new Promise((resolve, reject) => {
    let msg;
    let stream = client.createMessageStream(UID);
    stream.on("data", (chunk) => {
      msg += chunk.toString();
    })
    stream.on("error", (err) => {
      msg = `Stream message ${UID} error: ${err.toString()}`
      reject(msg)
    })
    stream.on("end", () => {
      resolve(msg)
    })
  })
}
