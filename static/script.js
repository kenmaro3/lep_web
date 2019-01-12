/* eslint-disable require-jsdoc */
$(function() {

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

  let localStream;
  let existingCall;

  peer.on('open', () => {
    $('#my-id').text(peer.id);
    peer.listAllPeers(peers => {
      $('#peers').text(peers);
      $('#num-of-peers').text(peers.length)
    });

    step1();
  });

  // Receiving a call
  peer.on('call', call => {
    // Answer the call automatically (instead of prompting user) for demo purposes
    call.answer(localStream);
    step3(call);
  });

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
    peer.listAllPeers(peers => {

      for (var i=0; i<peers.length; i++){

        if(peers[i] != peer.id){
          callList.push(peers[i]);
        }else{
        }
      }

    var callTo = callList[Math.floor(Math.random() * callList.length)];
    const call = peer.call(callTo, localStream);
    step3(call);


//##########
    const requestedPeer = callTo;
    if (!connectedPeers[callTo]) {  //########
      // Create 2 connections, one labelled chat and another labelled file.
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


  });

  $('#end-call').on('click', () => {
    existingCall.close();
    eachActiveConnection(c => {
      c.close();
    });
    step2();
  });

  // Retry if getUserMedia fails
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

    //    const constraints = {
    //      audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
    //      video: false,
    //    };
    //      navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    //      $('#my-video').get(0).srcObject = stream;
    //      localStream = stream;
    //
    //      if (existingCall) {
    //        existingCall.replaceStream(stream);
    //        return;
    //      }
    //
    //      });

      }

    }


  })

  function step1() {
    // Get audio/video stream
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
  peer.on('open', id => {
    $('#pid').text(id);
  });
  // Await connections from others
  peer.on('connection', c => {
    // Show connection when it is completely ready
    c.on('open', () => connect(c));
  });
  peer.on('error', err => console.log(err));

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







///* eslint-disable require-jsdoc */
//$(function() {
//  // Connect to SkyWay, have server assign an ID instead of providing one
//  // Showing off some of the configs available with SkyWay:).
//  const peer = new Peer({
//    // Set API key for cloud server (you don't need this if you're running your
//    // own.
//    key:         window.__SKYWAY_KEY__,
//    // Set highest debug level (log everything!).
//    debug:       3,
//    // Set a logging function:
//    logFunction: args => {
//      const copy = [...args].join(' ');
//      $('.log').append(copy + '<br>');
//    },
//  });
//  const connectedPeers = {};
//
//  // Show this peer's ID.
//  peer.on('open', id => {
//    $('#pid').text(id);
//  });
//  // Await connections from others
//  peer.on('connection', c => {
//    // Show connection when it is completely ready
//    c.on('open', () => connect(c));
//  });
//  peer.on('error', err => console.log(err));
//
//  // Prepare file drop box.
//  const box = $('#box');
//  box.on('dragenter', doNothing);
//  box.on('dragover', doNothing);
//  box.on('drop', e => {
//    e.originalEvent.preventDefault();
//    const [file] = e.originalEvent.dataTransfer.files;
//    eachActiveConnection((c, $c) => {
//      if (c.label === 'file') {
//        c.send(file);
//        $c.find('.messages').append('<div><span class="file">You sent a file.</span></div>');
//      }
//    });
//  });
//  function doNothing(e) {
//    e.preventDefault();
//    e.stopPropagation();
//  }
//
//  $('#rid').focus();
//
//  // Connect to a peer
//  $('#connect').on('submit', e => {
//    e.preventDefault();
//    const requestedPeer = $('#rid').val();
//    if (!connectedPeers[requestedPeer]) {
//      // Create 2 connections, one labelled chat and another labelled file.
//      const c = peer.connect(requestedPeer, {
//        label:    'chat',
//        metadata: {message: 'hi i want to chat with you!'},
//      });
//
//      c.on('open', () => {
//        connect(c);
//        connectedPeers[requestedPeer] = 1;
//      });
//
//      c.on('error', err => alert(err));
//
//      const f = peer.connect(requestedPeer, {label: 'file', reliable: true});
//
//      f.on('open', () => {
//        connect(f);
//      });
//
//      f.on('error', err => alert(err));
//    }
//  });
//
//  // Close a connection.
//  $('#close').on('click', () => {
//    eachActiveConnection(c => {
//      c.close();
//    });
//  });
//
//  // Send a chat message to all active connections.
//  $('#send').on('submit', e => {
//    e.preventDefault();
//    // For each active connection, send the message.
//    const msg = $('#text').val();
//    eachActiveConnection((c, $c) => {
//      if (c.label === 'chat') {
//        c.send(msg);
//        $c.find('.messages').append('<div><span class="you">You: </span>' + msg
//          + '</div>');
//      }
//    });
//    $('#text').val('');
//    $('#text').focus();
//  });
//
//  // Show browser version
//  $('#browsers').text(navigator.userAgent);
//
//  // Make sure things clean up properly.
//  window.onunload = window.onbeforeunload = function(e) {
//    if (!!peer && !peer.destroyed) {
//      peer.destroy();
//    }
//  };
//
//  // Handle a connection object.
//  function connect(c) {
//    // Handle a chat connection.
//    if (c.label === 'chat') {
//      const chatbox = $('<div></div>').addClass('connection').addClass('active').attr('id', c.remoteId);
//      const header = $('<h1></h1>').html('Chat with <strong>' + c.remoteId + '</strong>');
//      const messages = $('<div><em>Peer connected.</em></div>').addClass('messages');
//      chatbox.append(header);
//      chatbox.append(messages);
//      // Select connection handler.
//      chatbox.on('click', () => {
//        chatbox.toggleClass('active');
//      });
//
//      $('.filler').hide();
//      $('#connections').append(chatbox);
//
//      c.on('data', data => {
//        messages.append('<div><span class="peer">' + c.remoteId + '</span>: ' + data +
//          '</div>');
//      });
//
//      c.on('close', () => {
//        alert(c.remoteId + ' has left the chat.');
//        chatbox.remove();
//        if ($('.connection').length === 0) {
//          $('.filler').show();
//        }
//        delete connectedPeers[c.remoteId];
//      });
//    } else if (c.label === 'file') {
//      c.on('data', function(data) {
//        // If we're getting a file, create a URL for it.
//        let dataBlob;
//        if (data.constructor === ArrayBuffer) {
//          dataBlob = new Blob([new Uint8Array(data)]);
//        } else {
//          dataBlob = data;
//        }
//        const filename = dataBlob.name || 'file';
//        const url = URL.createObjectURL(dataBlob);
//        $('#' + c.remoteId).find('.messages').append('<div><span class="file">' +
//          c.remoteId + ' has sent you a <a target="_blank" href="' + url + '" download="' + filename + '">file</a>.</span></div>');
//      });
//    }
//    connectedPeers[c.remoteId] = 1;
//  }
//
//  // Goes through each active peer and calls FN on its connections.
//  function eachActiveConnection(fn) {
//    const actives = $('.active');
//    const checkedIds = {};
//    actives.each((_, el) => {
//      const peerId = $(el).attr('id');
//      if (!checkedIds[peerId]) {
//        const conns = peer.connections[peerId];
//        for (let i = 0, ii = conns.length; i < ii; i += 1) {
//          const conn = conns[i];
//          fn(conn, $(el));
//        }
//      }
//      checkedIds[peerId] = 1;
//    });
//  }
//});