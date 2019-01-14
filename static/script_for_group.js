/* eslint-disable require-jsdoc */
$(function() {

let myId = null;
let myRoom = null;
roomMembers = [];
const MAX_ROOM_NO = 10;
const MAX_MEMBER = 1;
let tryRoomNo = 1;
let tryAutoJoin = false;

autoJoinButton.onclick = _ => {
    addLog('Try Auto Join Start.');
    tryRoomNo = 1;
    autoJoinRoom();
}

desc.textContent = `各部屋、最大 ${MAX_MEMBER} 名まで`;

const peer = new Peer({
    key:   window.__SKYWAY_KEY__,
});

peer.on('open', id => {
    myIdDisp.textContent = myId = id;
    addLog('Peer Open.');
});

function autoJoinRoom() {
    leaveMyRoom();
    joinRoom(`Room_${tryRoomNo}`);
}

function joinRoom(roomName) {
    myRoom = peer.joinRoom(roomName);
    myRoom.on('open', function() {
        addRoomMember(this.name, myId);
        addLog(`[${this.name}] Joined.`);
    });
    myRoom.on('peerJoin', function(id) {
        addRoomMember(this.name, id);
        if(roomMembers.length > MAX_MEMBER) {
            addLog(`Send abort to <${id}>.`);
            this.send({abort:id});
        }
        addLog(`[${this.name}] Join Member <${id}]>.`);
        this.send({member:myId});
    });
    myRoom.on('peerLeave', function(id) {
        removeRoomMember(this.name, id);
        addLog(`[${this.name}] Leave Member <${id}>.`);
    });
    myRoom.on('data', function(msg) {
        addLog(`Message Received. ${JSON.stringify(msg.data)}`);
        if(msg.data.member) {
            addRoomMember(this.name, msg.data.member);
        } else if(msg.data.abort && msg.data.abort === myId) {
            leaveMyRoom();
            tryRoomNo++;
            if(tryRoomNo <= 10) {
                autoJoinRoom();
            } else {
                addLog('Auto Join Failed.');
            }
        }
    });
}

function leaveMyRoom() {
    if(!myRoom) return;
    roomMembers = [];
    const roomName = myRoom.name;
    myRoom.close();
    myRoom = null;
    removeRoomMember(roomName, myId);
    const memberList = document.querySelector(`#${roomName}MemberList`);
    if(memberList) memberList.innerHTML = '';
    addLog(`[${roomName}] Leaved.`);
}

function addRoomMember(roomName, id) {
    if(roomMembers.includes(id)) return;
    roomMembers.push(id);
    const roomMemberList = document.querySelector(`#${roomName}MemberList`);
    const member = document.createElement('div');
    member.id = `${roomName}_${id}`;
    member.textContent = id;
    roomMemberList.appendChild(member);
}

function removeRoomMember(roomName, id) {
    const idx = roomMembers.indexOf(id);
    if(idx !== -1) roomMembers.splice(idx, 1);
    const roomMemberList = document.querySelector(`#${roomName}MemberList`);
    const member = document.querySelector(`#${roomName}_${id}`);
    if(member) member.remove();
}

function addLog(msg) {
    const dt = new Date();
    const time = [
        `${dt.getHours()}`.padStart(2, '0'),
        `${dt.getMinutes()}`.padStart(2, '0'),
        `${dt.getSeconds()}`.padStart(2, '0')
    ].join(':');
    const div = document.createElement('div');
    div.textContent = `[${time}] ${msg}`;
    logList.insertBefore(div, logList.firstChild);
}



for(let i = 1; i <= MAX_ROOM_NO; i++){
    const room = document.createElement('div');
    const roomNameLabel = document.createElement('h3');
    const roomMemberListTitle = document.createElement('div');
    const roomMemberList = document.createElement('div');
    const connectRoomButton = document.createElement('button');
    const roomName = `Room_${i}`;
    roomNameLabel.textContent = roomName;
    roomMemberListTitle.textContent = 'ルームメンバー';
    roomMemberList.id = `${roomName}MemberList`;
    connectRoomButton.textContent = '入室';
    connectRoomButton.dataset.roomName = roomName;
    room.classList.add('room');
    roomNameLabel.classList.add('room-name');
    roomMemberListTitle.classList.add('room-memberlisttitle');
    roomMemberList.classList.add('room-memberlist');
    connectRoomButton.classList.add('connect-room-button');
    room.appendChild(roomNameLabel);
    room.appendChild(roomMemberListTitle);
    room.appendChild(roomMemberList);
    room.appendChild(connectRoomButton);
    roomList.appendChild(room);

    connectRoomButton.onclick = function(evt) {
        joinRoom(this.dataset.roomName);
    }
}

})