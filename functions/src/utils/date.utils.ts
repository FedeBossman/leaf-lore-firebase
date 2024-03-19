export const getStartOfDay = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const getEndOfDay = (date: Date): Date => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  );
};

export const getStartOfSeason = (currentDate: Date): Date => {
  const currentMonth = currentDate.getMonth();
  let startOfSeason: Date;
  if (currentMonth >= 2 && currentMonth <= 4) {
    startOfSeason = new Date(currentDate.getFullYear(), 2, 1);
  } else if (currentMonth >= 5 && currentMonth <= 7) {
    startOfSeason = new Date(currentDate.getFullYear(), 5, 1);
  } else if (currentMonth >= 8 && currentMonth <= 10) {
    startOfSeason = new Date(currentDate.getFullYear(), 8, 1);
  } else {
    startOfSeason = new Date(currentDate.getFullYear(), 11, 1);
  }
  return startOfSeason;
};

export const getEndOfSeason = (currentDate: Date): Date => {
  const currentMonth = currentDate.getMonth();
  let endOfSeason: Date;
  if (currentMonth >= 2 && currentMonth <= 4) {
    endOfSeason = new Date(currentDate.getFullYear(), 4, 30);
  } else if (currentMonth >= 5 && currentMonth <= 7) {
    endOfSeason = new Date(currentDate.getFullYear(), 7, 31);
  } else if (currentMonth >= 8 && currentMonth <= 10) {
    endOfSeason = new Date(currentDate.getFullYear(), 10, 30);
  } else {
    endOfSeason = new Date(currentDate.getFullYear(), 1, 31);
  }
  return endOfSeason;
};
