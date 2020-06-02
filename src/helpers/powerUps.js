const swapLines = (board1, board2) => {
  let swapped = [];
  let newBoard1 = [], newBoard2 = [];
  const blankRow = new Array(board1[0].length).fill(0);

  for(let i = board1.length - 4; i < board1.length; i++) {
    if(board1[i].some(cell => cell > 0)) swapped.push([...board1[i]]);
  }

  for(let i = 0; i < swapped.length; i++) newBoard1.push([...blankRow]);
  for(let j = 0; j <  board1.length - swapped.length; j++) newBoard1.push([...board1[j]]);
  
  for(let i = swapped.length; i < board2.length; i++) newBoard2.push([...board2[i]]);
  newBoard2.push(...swapped);

  return [newBoard1, newBoard2];
}

module.exports = {
  swapLines,
}