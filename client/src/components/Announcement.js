import React from 'react';

const styles = {
  height: '30px',
  backgroundColor: 'teal',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  fontWeight: 500,
};

const Announcement = () => {
  return (
    <div style={styles}>
      Super Deal! Free Shipping on Orders Over $500
    </div>
  );
};

export default Announcement;
