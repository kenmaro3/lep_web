/* eslint-disable require-jsdoc */
$(function() {

let myId = null;
let myRoom = null;
roomMembers = [];
const MAX_ROOM_NO = 5;
const MAX_MEMBER = 2;
let tryRoomNo = 1;
let tryAutoJoin = false;


  console.log('at least starts here');
  $.ajax({
    url: '/line_notice_english',
    type: 'post'
  });





// Peer object
const peer = new Peer({
  key:   window.__SKYWAY_KEY__,
  debug: 3,
});

addLog('Try Auto Join Start.');
console.log('Try Auto Join Start.');
tryRoomNo = 1;


  let localStream;
  let existingCall;


      $("#roommember").click(function(){
      console.log('roombutton is clicked');

      console.log(roomMembers);



    });




    $("#testbutton").click(function(){
      console.log('button is clicked');

      var textData = JSON.stringify({"text":$("#input-text").val()});
      console.log(textData);

      $.ajax({
        url: '/toPostURL',
        type: 'post',
        data: textData,
        contentType: 'application/json',

        success:function(data){
          console.log('i am called');
          var result = JSON.parse(data.ResultSet).result;
          console.log(result);
          $("#result").text(result);


        }

      });

    });


autoJoinButton.onclick = _ => {
    addLog('Try Auto Join Start.');
    tryRoomNo = 1;
    autoJoinRoom();
}




  peer.on('open', () => {
    myIdDisp.textContent = myId = peer.id;
    autoJoinRoom();
    console.log("peer is open");
    $('#my-id').text(peer.id);
    $('#pid').text(peer.id);

    addLog('Peer Open.');
    peer.listAllPeers(peers => {
      $('#peers').text(peers);
      $('#num-of-peers').text(peers.length);

    });
    console.log('step1 will be called');
    step1();
    console.log('step1 was called');
  });


function autoJoinRoom() {
  leaveMyRoom();
  joinRoom(`Room_${tryRoomNo}`);
  console.log('at the end of the autoJoinRoom');
}

function joinRoom(roomName) {
    console.log("joinRoom is called");
    myRoom = peer.joinRoom(roomName);
    myRoom.on('open', function() {
        addRoomMember(this.name, myId);
        addLog(`[${this.name}] Joined.`);
    });

    console.log('checkpoint1');
    myRoom.on('peerJoin', function(id) {
        addRoomMember(this.name, id);
        if(roomMembers.length > MAX_MEMBER) {
            addLog(`Send abort to <${id}>.`);
            this.send({abort:id});
        }
        addLog(`[${this.name}] Join Member <${id}]>.`);
        this.send({member:myId});
    });

    console.log('checkpoint2');
    myRoom.on('peerLeave', function(id) {
        removeRoomMember(this.name, id);
        addLog(`[${this.name}] Leave Member <${id}>.`);
    });

    console.log('checkpoint3');
    myRoom.on('data', function(msg) {
        addLog(`Message Received. ${JSON.stringify(msg.data)}`);
        if(msg.data.member) {
            addRoomMember(this.name, msg.data.member);
            console.log('checkpoint4');
        } else if(msg.data.abort && msg.data.abort === myId) {
            leaveMyRoom();
            tryRoomNo++;
            console.log('checkpoint5');
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
//    logList.insertBefore(div, logList.firstChild);
}


console.log('before the for loop');
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
console.log('after the for loop');


  console.log('call the roommenbers now');
  console.log(roomMembers);
  // Receiving a call
  peer.on('call', call => {
    // Answer the call automatically (instead of prompting user) for demo purposes
    call.answer(localStream);
    step3(call);
  });

  console.log("after the peer.on(call)");

  peer.on('error', err => {
    alert(err.message);
    // Return to step 2 if error occurs
    step2();
  });

  $('#make-call').on('submit', e => {
    e.preventDefault();
    // Initiate a call!
    console.log($('#callto-id').val());
    const call = peer.call($('#callto-id').val(), localStream);
    $('#rid').text = $('#callto-id');
    step3(call);
  });

  $('#make-random-call').on('submit', e => {
    e.preventDefault();
    // Initiate a call!
    var callList = new Array();



      for (var i=0; i<roomMembers.length; i++){

        if(roomMembers[i] != peer.id){
          callList.push(roomMembers[i]);
        }else{
        }
      }

    var callTo = callList[Math.floor(Math.random() * callList.length)];
    const call = peer.call(callTo, localStream);
    step3(call);


    console.log('start the code for chat');
    const requestedPeer = callTo;
    if (!connectedPeers[callTo]) {  //########
      // Create 2 connections, one labelled chat and another labelled file.
      console.log('before sending the greeting chat to callTo');
      const c = peer.connect(requestedPeer, {
        label:    'chat',
        metadata: {message: 'hi i want to chat with you!'},
      });

      c.on('open', () => {
        connect(c);
        connectedPeers[callTo] = 1;  //########
      });

      c.on('error', err => alert(err));

      const f = peer.connect(callTo, {label: 'file', reliable: true});   //########

      f.on('open', () => {
        connect(f);
      });

      f.on('error', err => alert(err));
    }





  });

  $('#end-call').on('click', () => {
    console.log('end-call is hit');
    existingCall.close();
    eachActiveConnection(c => {
      c.close();
    });
    step2();
  });

//   Retry if getUserMedia fails
  $('#step1-retry').on('click', () => {
    $('#step1-error').hide();
    step1();
  });

  // set up audio and video input selectors
  const audioSelect = $('#audioSource');
  const videoSelect = $('#videoSource');
  const selectors = [audioSelect, videoSelect];

  navigator.mediaDevices.enumerateDevices()
    .then(deviceInfos => {
      const values = selectors.map(select => select.val() || '');
      selectors.forEach(select => {
        const children = select.children(':first');
        while (children.length) {
          select.remove(children);
        }
      });

      for (let i = 0; i !== deviceInfos.length; ++i) {
        const deviceInfo = deviceInfos[i];
        const option = $('<option>').val(deviceInfo.deviceId);

        if (deviceInfo.kind === 'audioinput') {
          option.text(deviceInfo.label ||
            'Microphone ' + (audioSelect.children().length + 1));
          audioSelect.append(option);
        } else if (deviceInfo.kind === 'videoinput') {
          option.text(deviceInfo.label ||
            'Camera ' + (videoSelect.children().length + 1));
          videoSelect.append(option);
        }
      }

      selectors.forEach((select, selectorIndex) => {
        if (Array.prototype.slice.call(select.children()).some(n => {
          return n.value === values[selectorIndex];
        })) {
          select.val(values[selectorIndex]);
        }
      });

      videoSelect.on('change', step1);
      audioSelect.on('change', step1);
    });


  $('#video-switch').change(function(){


    if ($(this).prop('checked')){
        const audioSource = $('#audioSource').val();
        const videoSource = $('#videoSource').val();
        const constraints = {
          audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
          video: {deviceId: videoSource ? {exact: videoSource} : undefined},
        };
          navigator.mediaDevices.getUserMedia(constraints).then(stream => {
          $('#my-video').get(0).srcObject = stream;
          localStream = stream;

          if (existingCall) {
            existingCall.replaceStream(stream);
            return;
          }

          });
    }else{
        const audioSource = $('#audioSource').val();
        const videoSource = $('#videoSource').val();
        const constraints = {
          audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
          video: false,
        };

          navigator.mediaDevices.getUserMedia(constraints).then(stream => {
          $('#my-video').get(0).srcObject = stream;
          localStream = stream;

          if (existingCall) {
            existingCall.replaceStream(stream);
            return;
          }

          });
    }

    function setVideoEnable(boolEnable){
      if(boolEnable){
        const audioSource = $('#audioSource').val();
        const videoSource = $('#videoSource').val();
        const constraints = {
          audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
          video: {deviceId: videoSource ? {exact: videoSource} : undefined},
        };
          navigator.mediaDevices.getUserMedia(constraints).then(stream => {
          $('#my-video').get(0).srcObject = stream;
          localStream = stream;

          if (existingCall) {
            existingCall.replaceStream(stream);
            return;
          }

          });

      }else{

      }

    }


  })

  function step1() {
//     Get audio/video stream
    const audioSource = $('#audioSource').val();
    const videoSource = $('#videoSource').val();
    const constraints = {
      audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
      video: {deviceId: videoSource ? {exact: videoSource} : undefined},
    };

    console.log(constraints);

    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
      $('#my-video').get(0).srcObject = stream;
      localStream = stream;

      if (existingCall) {
        existingCall.replaceStream(stream);
        return;
      }

      step2();
    }).catch(err => {
      $('#step1-error').show();
      console.error(err);
    });


  }

  function step2() {
    $('#step1, #step3').hide();
    $('#step2').show();
    $('#callto-id').focus();
  }

  function step3(call) {
    // Hang up on an existing call if present
    if (existingCall) {
      existingCall.close();
    }
    // Wait for stream on the call, then set peer video display
    call.on('stream', stream => {
      const el = $('#their-video').get(0);
      el.srcObject = stream;
      el.play();
    });

    // UI stuff
    existingCall = call;
    $('#their-id').text(call.remoteId);
    call.on('close', step2);
    $('#step1, #step2').hide();
    $('#step3').show();
  }




//####################################
const connectedPeers = {};

  // Show this peer's ID.
//  peer.on('open', id => {
//    $('#pid').text(id);
//  });
//  // Await connections from others
//  peer.on('connection', c => {
//    // Show connection when it is completely ready
//    c.on('open', () => connect(c));
//  });
//  peer.on('error', err => console.log(err));



  // Prepare file drop box.
  const box = $('#box');
  box.on('dragenter', doNothing);
  box.on('dragover', doNothing);
  box.on('drop', e => {
    e.originalEvent.preventDefault();
    const [file] = e.originalEvent.dataTransfer.files;
    eachActiveConnection((c, $c) => {
      if (c.label === 'file') {
        c.send(file);
        $c.find('.messages').append('<div><span class="file">You sent a file.</span></div>');
      }
    });
  });
  function doNothing(e) {
    e.preventDefault();
    e.stopPropagation();
  }


  // Connect to a peer
  $('#connect').on('submit', e => {
    e.preventDefault();
    const requestedPeer = $('#rid').val();
    if (!connectedPeers[requestedPeer]) {
      // Create 2 connections, one labelled chat and another labelled file.
      const c = peer.connect(requestedPeer, {
        label:    'chat',
        metadata: {message: 'hi i want to chat with you!'},
      });

      c.on('open', () => {
        connect(c);
        connectedPeers[requestedPeer] = 1;
      });

      c.on('error', err => alert(err));

      const f = peer.connect(requestedPeer, {label: 'file', reliable: true});

      f.on('open', () => {
        connect(f);
      });

      f.on('error', err => alert(err));
    }
  });

  // Close a connection.
  $('#close').on('click', () => {
    eachActiveConnection(c => {
      c.close();
    });
  });

  // Send a chat message to all active connections.
  $('#send').on('submit', e => {
    e.preventDefault();
    // For each active connection, send the message.
    const msg = $('#text').val();
    eachActiveConnection((c, $c) => {
      if (c.label === 'chat') {
        c.send(msg);
        $c.find('.messages').append('<div><span class="you">You: </span>' + msg
          + '</div>');
      }
    });
    $('#text').val('');
    $('#text').focus();
  });

  // Show browser version
  $('#browsers').text(navigator.userAgent);

  // Make sure things clean up properly.
  window.onunload = window.onbeforeunload = function(e) {
    if (!!peer && !peer.destroyed) {
      peer.destroy();
    }
  };

  // Handle a connection object.
  function connect(c) {
    // Handle a chat connection.
    if (c.label === 'chat') {
      const chatbox = $('<div></div>').addClass('connection').addClass('active').attr('id', c.remoteId);
      const header = $('<h1></h1>').html('Chat with <strong>' + c.remoteId + '</strong>');
      const messages = $('<div><em>Peer connected.</em></div>').addClass('messages');
      chatbox.append(header);
      chatbox.append(messages);
      // Select connection handler.
      chatbox.on('click', () => {
        chatbox.toggleClass('active');
      });

      $('.filler').hide();
      $('#connections').append(chatbox);

      c.on('data', data => {
        messages.append('<div><span class="peer">' + c.remoteId + '</span>: ' + data +
          '</div>');
      });

      c.on('close', () => {
        alert(c.remoteId + ' has left the chat.');
        chatbox.remove();
        if ($('.connection').length === 0) {
          $('.filler').show();
        }
        delete connectedPeers[c.remoteId];
      });
    } else if (c.label === 'file') {
      c.on('data', function(data) {
        // If we're getting a file, create a URL for it.
        let dataBlob;
        if (data.constructor === ArrayBuffer) {
          dataBlob = new Blob([new Uint8Array(data)]);
        } else {
          dataBlob = data;
        }
        const filename = dataBlob.name || 'file';
        const url = URL.createObjectURL(dataBlob);
        $('#' + c.remoteId).find('.messages').append('<div><span class="file">' +
          c.remoteId + ' has sent you a <a target="_blank" href="' + url + '" download="' + filename + '">file</a>.</span></div>');
      });
    }
    connectedPeers[c.remoteId] = 1;
  }

  // Goes through each active peer and calls FN on its connections.
  function eachActiveConnection(fn) {
    const actives = $('.active');
    const checkedIds = {};
    actives.each((_, el) => {
      const peerId = $(el).attr('id');
      if (!checkedIds[peerId]) {
        const conns = peer.connections[peerId];
        for (let i = 0, ii = conns.length; i < ii; i += 1) {
          const conn = conns[i];
          fn(conn, $(el));
        }
      }
      checkedIds[peerId] = 1;
    });
  }


  function connectChat(id){

  }




});


