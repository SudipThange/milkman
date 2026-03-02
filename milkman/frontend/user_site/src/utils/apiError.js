function flattenErrorMessages(value) {
  if (!value) return [];

  if (typeof value === "string") return [value];
  if (Array.isArray(value)) {
    return value.flatMap((entry) => flattenErrorMessages(entry));
  }
  if (typeof value === "object") {
    return Object.values(value).flatMap((entry) => flattenErrorMessages(entry));
  }

  return [];
}

export function getApiErrorMessage(error, fallbackMessage = "Something went wrong.") {
  if (!error?.response) {
    return "Unable to reach the server. Please check your internet connection.";
  }

  const { status, data } = error.response;

  if (status === 401) {
    return "Your session expired. Please login again.";
  }

  if (status >= 500) {
    return "Server error while processing your request. Please try again.";
  }

  const messages = flattenErrorMessages(data);
  if (messages.length > 0) return messages[0];

  return fallbackMessage;
}
