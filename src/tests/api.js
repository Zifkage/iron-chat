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
    return axios.post(API_URL, {
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
};
