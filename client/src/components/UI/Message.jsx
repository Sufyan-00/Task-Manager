import React from 'react';
import './Message.css';

const Message = ({ type = 'info', children }) => (
  <div className={`message ${type}`}>
    {children}
  </div>
);

export default Message;