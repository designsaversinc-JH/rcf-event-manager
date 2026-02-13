export const formatDate = (input) => {
  if (!input) {
    return 'Unpublished';
  }

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return 'Unpublished';
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const formatDateTime = (input) => {
  if (!input) {
    return '';
  }

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
