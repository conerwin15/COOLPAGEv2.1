import React from 'react';

export default function About() {
  const styles = {
    container: {
      maxWidth: '900px',
      margin: '0 auto',
      padding: '30px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: '#f4f6f9',
      color: '#333',
    },
    bannerImage: {
      width: '100%',
      height: '300px',
      objectFit: 'cover',
      borderBottom: '4px solid #007bff',
      borderRadius: '4px',
    },
    heading: {
      textAlign: 'center',
      color: '#007bff',
      marginTop: '30px',
    },
    highlight: {
      fontWeight: 'bold',
      color: '#444',
    },
    italic: {
      fontStyle: 'italic',
    },
    paragraph: {
      lineHeight: '1.7',
      fontSize: '17px',
      marginTop: '20px',
    },
  };

  return (
    <div style={styles.container}>
      <img
        style={styles.bannerImage}
        src="	https://fms.techtreeglobal.com/assets/uploads/1750992840_CoolImage.jpg"
        alt="COOL Session Banner"
      />
      <h1 style={styles.heading}>About Us</h1>

      <p style={styles.paragraph}>
        <span style={styles.highlight}>COOL Session</span> stands for{' '}
        <span style={styles.italic}>Community of Online Learning Session</span>. It is an
        interactive, learner-centered approach designed to foster engagement, collaboration, and
        active participation among members of a digital learning community.
      </p>

      <p style={styles.paragraph}>
        A COOL Session typically integrates real-time discussions, multimedia presentations, and
        user-generated content to create a dynamic and inclusive learning environment. The core idea
        behind a COOL Session is to make education more engaging and accessible, especially in
        digital platforms where personal connection and motivation can sometimes be lacking.
      </p>

      <p style={styles.paragraph}>
        It emphasizes interaction between learners and facilitators, peer-to-peer learning, and
        practical application of knowledge through discussions, activities, and reflective sharing.
      </p>

      <p style={styles.paragraph}>
        COOL Sessions can be used in classrooms, training workshops, or online platforms like
        community apps, and are effective across various age groups and learning contexts. They are
        especially powerful in building soft skills such as communication, teamwork, and digital
        literacy.
      </p>

      <p style={styles.paragraph}>
        A successful COOL Session is well-planned, time-efficient, and encourages every participant
        to contribute meaningfully. In essence, COOL Sessions are not just about delivering
        content—they are about creating a learning{' '}
        <span style={styles.italic}>experience</span>.
      </p>

      <p style={styles.paragraph}>
        By making sessions “COOL,” educators ensure that learners stay motivated, retain more
        information, and feel a stronger sense of belonging within the learning community.
      </p>
    </div>
  );
}
