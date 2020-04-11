import React from 'react';
import { Button } from 'antd';
import { useState } from 'react';
import { useEffect } from 'react';

const popup = (url, origin) => {
  const windowArea = {
    width: Math.floor(window.outerWidth * 0.8),
    height: Math.floor(window.outerHeight * 0.5),
  };

  if (windowArea.width < 1000) { windowArea.width = 1000; }
  if (windowArea.height < 630) { windowArea.height = 630; }
  windowArea.left = Math.floor(window.screenX + ((window.outerWidth - windowArea.width) / 2));
  windowArea.top = Math.floor(window.screenY + ((window.outerHeight - windowArea.height) / 8));

  const sep = (url.indexOf('?') !== -1) ? '&' : '?';
  const seperatedUrl = `${url}${sep}`;
  const windowOpts = `toolbar=0,scrollbars=1,status=1,resizable=1,location=1,menuBar=0,
    width=${windowArea.width},height=${windowArea.height},
    left=${windowArea.left},top=${windowArea.top}`;

  const authWindow = window.open(seperatedUrl, 'producthuntPopup', windowOpts);
  // Create IE + others compatible event handler
  const eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent';
  const eventer = window[eventMethod];
  const messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message';

  // Listen to message from child window
  const authPromise = new Promise((resolve, reject) => {
    eventer(messageEvent, (e) => {
      if (e.origin !== origin) {
        authWindow.close();
        reject('Not allowed');
      }

      if (e.data.cookie) {
        resolve(JSON.parse(e.data.cookie));
        authWindow.close();
      } else {
        authWindow.close();
        reject('Unauthorised');
      }
    }, false);
  });

  return authPromise;
};

if (window.opener) {
  // alert(document.cookie);
  window.opener.postMessage(
    { cookie: document.cookie },
    window.opener.location
  );
  
  // window.opener.postMessage(
  //   { error: 'Login failed' },
  //   window.opener.location
  // );
  
}

const LoginAndSubmitBtn = ({ form }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [submitText, setSubmitText] = useState('Submit');

  useEffect(() => {
    fetch('/users/check_for_sign_in')
      .then(res => res.json())
      .then(res => {
        setIsLoggedIn(res.isLoggedIn);
        if (!res.isLoggedIn) {
          setSubmitText('Login and Submit');
        } 
        // else {
        //   const values = JSON.parse(localStorage.getItem('availabilityReport'));
        //   form.setFieldsValue(values);
        //   const hasErrors = Object.values(form.getFieldsError()).some(({ errors }) => errors.length);
        //   // Note: this implementation assumes that if there are not errors on mount 
        //   // then the user has been redirected after login and has already filled form before submit
        //   // it avoids user having to click the submit button again. This flow is favorable at the moment 
        //   // than forcing user to login ever before he fills the form. hence login and submit buttons are combined to one
        //   if (!hasErrors) {
        //     form.submit();
        //   }
        // }
      })
  }, []);

  const onClickHandler = () => {
    // form.validateFields()
    //   .then(() => {
        if (!isLoggedIn) {
          // localStorage.setItem('availabilityReport', JSON.stringify(form.getFieldsValue(true)));
          // window.location.href = '/users/auth/twitter'
          popup(`${window.location.origin}/users/auth/twitter`, window.location.origin)
            .then(console.debug)
            .catch(console.error);
        } else {
          form.submit();
        }
    // })
  };

  return (
    <Button className="AvailabilityReport__submit-btn" type="primary" onClick={onClickHandler}>
      {submitText}
    </Button>
  )
};

export default LoginAndSubmitBtn;