import axios from 'axios';

const API_URL = 'http://localhost:8000/graphql';

export const user = async variables =>
  axios.post(API_URL, {
    query: `
      query($id: ID!) {
        user(id: $id) {
          id
          username
          email
          roles
        }
      }
    `,
    variables,
  });

export const signIn = async variables =>
  await axios.post(API_URL, {
    query: `
      mutation ($login: String!, $password: String!) {
        signIn(login: $login, password: $password) {
          token
        }
      }
    `,
    variables,
  });

export const deleteUser = async (variables, token) =>
  axios.post(
    API_URL,
    {
      query: `
        mutation ($id: ID!) {
          deleteUser(id: $id)
        }
      `,
      variables,
    },
    {
      headers: {
        'x-token': token,
      },
    },
  );

export const message = async variables =>
  axios.post(API_URL, {
    query: `
        query ($id: ID!) {
          message(id: $id) {
            id
            text
            user {
              username
            }
          }
        }
      `,
    variables,
  });

export const deleteMessage = async (variables, token) =>
  axios.post(
    API_URL,
    {
      query: `
        mutation ($id: ID!) {
          deleteMessage(id: $id)
        }
    `,
      variables,
    },
    {
      headers: {
        'x-token': token,
      },
    },
  );

// channel
export const createChannel = async (variables, token) => {
  if (!token) {
    return await axios.post(API_URL, {
      query: `
        mutation ($title: String!, $description: String) {
          createChannel(title: $title, description: $description) {
            title
            description
            user {
              username
            }
          }
        }
      `,
      variables,
    });
  }
  return await axios.post(
    API_URL,
    {
      query: `
        mutation ($title: String!, $description: String) {
          createChannel(title: $title, description: $description) {
            id
            title
            description
            user {
              username
            }
            members {
              user {
                username
              }
            }
          }
        }
      `,
      variables,
    },
    {
      headers: {
        'x-token': token,
      },
    },
  );
};

export const deleteChannel = async (variables, token) =>
  await axios.post(
    API_URL,
    {
      query: `
        mutation($id: ID!) {
          deleteChannel(id: $id)
        }
      `,
      variables,
    },
    {
      headers: {
        'x-token': token,
      },
    },
  );

export const myChannels = async token =>
  await axios.post(
    API_URL,
    {
      query: `
        query {
          myChannels {
            id
            title
            description
            user {
              username
            }
          }
        }
      `,
    },
    {
      headers: {
        'x-token': token || '',
      },
    },
  );

export const updateChannel = async (variables, token) =>
  await axios.post(
    API_URL,
    {
      query: `
        mutation ($id: ID!, $title: String, $description: String) {
          updateChannel(id: $id, title: $title, description: $description)
        }
      `,
      variables,
    },
    {
      headers: {
        'x-token': token,
      },
    },
  );

export const addMembers = async (variables, token) =>
  await axios.post(
    API_URL,
    {
      query: `
        mutation($channelId: ID!, $usersIds: [ID!]!) {
          addMembers(channelId: $channelId, usersIds: $usersIds) {
            user {
              username
            }
            channel {
              id
            }
          }
        }
      `,
      variables,
    },
    {
      headers: {
        'x-token': token,
      },
    },
  );

export const members = async (variables, token) =>
  await axios.post(
    API_URL,
    {
      query: `
          query($channelId: ID!) {
            members(channelId: $channelId,) {
              user {
                username
              }
              channel {
                id
              }
            }
          }
        `,
      variables,
    },
    {
      headers: {
        'x-token': token || '',
      },
    },
  );
