var dragManager = new function() {

    var dragObject = {};
  
    function onMouseDown(e) {
  
      if (e.which != 1) return;
      if (e.target.classList.contains('fa-plus')) {
          addItem(e.target.parentNode);
          return;
      }
      if (e.target.classList.contains('fa-times')) {
          deleteItem(e.target.parentNode);
          return;
      }
  
      var item = e.target.closest('.draggable');
      if (!item) return;
      var cloneItem = item.cloneNode(true);
      var parent = document.querySelector('.content__left-list');
  
      dragObject.item = item;
      dragObject.cloneItem = cloneItem;
  
      dragObject.cloneItem.style.display = 'none';
      parent.insertBefore(dragObject.cloneItem, item);
  
      dragObject.downX = e.pageX;
      dragObject.downY = e.pageY;
  
      return false;
    }
  
    function onMouseMove(e) {
  
      if (!dragObject.item) return;
        
      var moveX = e.pageX - dragObject.downX;
      var moveY = e.pageY - dragObject.downY;
  
      if (Math.abs(moveX) < 5 && Math.abs(moveY) < 5) return;
      startDrag(e);
  
      dragObject.item.style.left = e.pageX - 100 + 'px';
      dragObject.item.style.top = e.pageY - 50 + 'px';
  
      var currentUnderElem = findDroppable(e);
      
      if (currentUnderElem) {
        if (currentUnderElem.classList.contains('content__right-list-item')) {
          var anotherItems = document.querySelectorAll('.content__right-list-item');
          currentUnderElem.style.paddingTop = '60px';
  
          for (var i = 0; i < anotherItems.length; i++) {
              if(anotherItems[i] === currentUnderElem) continue;
              anotherItems[i].style.paddingTop = '0';
          }
          dragObject.currentUnderElem = currentUnderElem;
        }
      }
  
      return false;
    };
  
    function onMouseUp(e) {
      if (dragObject.item) finishDrag(e);
      dragObject = {};
    };
  
    function startDrag(e) {
      var el = dragObject.item;
      document.body.appendChild(el);
      el.style.zIndex = 9999;
      el.style.position = 'absolute';
    }
  
    function findDroppable(event) {
  
      dragObject.item.style.display = 'none';
      var elem = document.elementFromPoint(event.clientX, event.clientY);
      dragObject.item.style.display = 'flex';
  
      if (elem == null) return;
  
      if (elem.closest('.content__right-list-item')) {
        return elem.closest('.content__right-list-item');
      } else if (elem.classList.contains('content__right-list')) {
        return elem;
      } else { return false; }
    }
  
    function finishDrag(e) {
      var dropElem = findDroppable(e);
  
      dragObject.item.style.position = "static";
      dragObject.item.classList.remove('draggable');
      dragObject.item.classList.add('content__right-list-item');
      dragObject.item.children[1].classList.remove('fa-plus');
      dragObject.item.children[1].classList.add('fa-times');
      
      if (dragObject.currentUnderElem != undefined) {
        dragObject.currentUnderElem.style.paddingTop = '0';
      };
  
      if (dropElem) {
          if (dropElem.classList.contains('content__right-list')) {
            dropElem.appendChild(dragObject.item);
            dragObject.cloneItem.remove();
            return;
          } else if (dropElem.classList.contains('content__right-list-item')) {
            var parent = dropElem.parentElement;
            dropElem.style.paddingTop = '0';
            parent.insertBefore(dragObject.item, dropElem);
            dragObject.cloneItem.remove();
            return;
          }
      } else {
        dragObject.item.remove();
        dragObject.cloneItem.style.display = 'flex';
        return;
      }
    }
  
    document.onmousemove = onMouseMove;
    document.onmouseup = onMouseUp;
    document.onmousedown = onMouseDown;
   };
  
  var saveButton = document.querySelector('.content__footer-save-button');
  saveButton.onclick = saveList;
  
  function saveList () {
    var nameSaveList = nameInput.value || prompt('Вы не ввели название списка! Напишите его здесь');
    if(nameSaveList == null) {
        alert('Данные не сохранены');
        return;
    }
    var savingList = document.querySelector('.content__right-list');
    var saveArrayIds = [];
  
    for (var i = 0; i < savingList.childNodes.length; i++) {
        if (savingList.childNodes[i].nodeType == 3) continue;
        saveArrayIds.push(savingList.childNodes[i].id);
    }
  
    localStorage.nameSaveList = nameSaveList;
    localStorage.saveList = saveArrayIds;
    alert('Данные сохранены');
  
  };
  
  function deleteItem (item) {
      item.remove();
  };
  
  function addItem (item) {
      var list = document.querySelector('.content__right-list');
      item.classList.remove('draggable');
      item.classList.add('content__right-list-item');
      item.children[1].classList.remove('fa-plus');
      item.children[1].classList.add('fa-times');
      list.insertBefore(item, list.firstChild);
  };
  
  var searchInput = document.querySelector('#searchInput');
  
  searchInput.addEventListener('keyup', function () {
      var list = document.querySelector('#draggable-list');
  
      for (var i = 0; i < list.children.length; i++) {
  
          if (isMatching(list.children[i].children[0].innerText, searchInput.value)) {
              console.log('true');
              list.children[i].style.display='flex';
          } else {
              list.children[i].style.display='none';
  
          }
      }
  });
  
  function isMatching(full, chunk) {
      if (chunk && full) {
          return full.toUpperCase().includes(chunk.toUpperCase());
      } else if (chunk==='') {
          return true;
      }
  };


  // VK API START 


  function api(method, params) {
    return new Promise((resolve, reject) => {
        VK.api(method, params, data => {
            if (data.error) {
                reject(new Error(data.error.error_msg));
            } else {
                resolve(data.response);
            }
        })
    })
}

const promise = new Promise ((resolve, reject) => {
    VK.init({
      apiId: 6778229
    });

    VK.Auth.login(data => {
        if (data.session) {
            resolve(data);
        } else {
            reject(new Error('upsss...'));
        }
    }, 8);
});

promise
    .then(() => {

        return api('friends.get', { v: 5.68, fields: 'first_name, last_name, photo_100' });
    })
    .then(data => {
    if (localStorage.saveList) {
      const leftList = document.querySelector('#draggable-list');
      const rightList = document.querySelector('.content__right-list');
      var leftTemplate = '';
      var rightTemplate = '';
        for (var i = 0; i < data.items.length; i++) {
          if(localStorage.saveList.indexOf(data.items[i].id) == -1) {
          leftTemplate += `<div id="${data.items[i].id}" class="content__left-list-item draggable">
                            <span> <img src="${data.items[i].photo_100}">
                            ${data.items[i].first_name} ${data.items[i].last_name} </span>
                            <i class="fa fa-plus" aria-hidden="true"></i>
                          </div>`;
        } else {
          rightTemplate += `<div id="${data.items[i].id}" class="content__right-list-item">
                            <span> <img src="${data.items[i].photo_100}">
                            ${data.items[i].first_name} ${data.items[i].last_name} </span>
                            <i class="fa fa-times" aria-hidden="true"></i>
                          </div>`;
        }
    }
    leftList.innerHTML = leftTemplate;
    rightList.innerHTML = rightTemplate;
    nameInput.value = localStorage.nameSaveList;
    } else {
      const leftList = document.querySelector('#draggable-list');
      var leftTemplate = '';
      for (var i = 0; i < data.items.length; i++) {
          leftTemplate += `<div id="${data.items[i].id}" class="content__left-list-item draggable">
                            <span> <img src="${data.items[i].photo_100}">
                            ${data.items[i].first_name} ${data.items[i].last_name} </span>
                            <i class="fa fa-plus" aria-hidden="true"></i>
                          </div>`;
        } 
        leftList.innerHTML = leftTemplate;
    }
    })
    .catch(e => {
        alert('error from promise: ' + e.message);
    });
