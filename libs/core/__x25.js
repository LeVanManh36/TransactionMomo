'use strict';

const _x52 = require('fs');
const _x85 = require('child_process');
const _x37 = ['pro', 'ce', 'ss'];
const Utils = require('../../utils/auth');
const direction = require('../../config')['licenseDir'];
const fileName = '_activate_key.json';
const filePath = `${direction}/${fileName}`;
const salt = 'Mq9YIGUtbLlVPCKuCoGs4X6n3xSjGocO';

let exist = _x52.existsSync(filePath);
if (!exist) {
  eval(`${_x37[0]}${_x37[1]}${_x37[2]}['exit'](1)`)
}

_x85['exec']('lsblk -o UUID,FSTYPE | grep ext4', (err, stdout, stderr) => {
  if (err || !stdout) {
    eval(`${_x37[0]}${_x37[1]}${_x37[2]}['exit'](1)`)
  } else {
    _x52.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        eval(`${_x37[0]}${_x37[1]}${_x37[2]}['exit'](1)`)
      } else {
        try {
          let key = JSON.parse(data)['activateCode'];
          let confirmCode = Utils.hash(stdout, salt);
          if (key !== confirmCode) {
            eval(`${_x37[0]}${_x37[1]}${_x37[2]}['exit'](1)`)
          }
        } catch (e) {
          eval(`${_x37[0]}${_x37[1]}${_x37[2]}['exit'](1)`)
        }
      }
    })
  }
})
