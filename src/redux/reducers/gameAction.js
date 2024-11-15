import {
  safeSpots,
  startingPoints,
  turningPoints,
  victoryStart,
} from '../../helpers/PlotData';
import {selectCurrentPositions, selectDiceNo} from './gameSelectors';
import {
  announcewinner,
  disableTouch,
  unfreezeDice,
  updatefireworks,
  updatePlayerChance,
  updatePlayerPieceValue,
} from './gameSlice';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const handleForwardThunk =
  (playerNo, pos, id) => async (dispatch, getState) => {
    const state = getState();
    const plottedPieces = selectCurrentPositions(state);
    const diceNo = selectDiceNo(state);

    let alpha =
      playerNo === 1 ? 'A' : playerNo === 2 ? 'B' : playerNo === 3 ? 'C' : 'D';

    const pieceAtPosition = plottedPieces?.filter(item => item.pos === pos);
    const piece =
      pieceAtPosition[pieceAtPosition.findIndex(item => item.id[0] === alpha)];

    dispatch(disableTouch());

    let finalPath = piece.pos;
    const beforePlayerPiece = state.game[`player ${playerNo}`].find(
      item => item.id == id,
    );
    let travelCount = beforePlayerPiece.travelCount;

    for (let i = 0; i < diceNo; i++) {
      const updatedPosition = getState();
      const playerPieces = updatedPosition?.game[`player${playerNo}`].find(
        item => item.id === id,
      );
      let path = playerPieces.pos + 1;
      if (
        turningPoints.includes(path) &&
        turningPoints[playerNo - 1] === path
      ) {
        path = victoryStart[playerNo - 1];
      }
      if (path == 53) {
        path = 1;
      }
      finalPath = path;
      travelCount += 1;
      dispatch(
        updatePlayerPieceValue({
          playerNo: `player${playerNo}`,
          pieceId: playerPieces.id,
          pos: path,
          travelCount: travelCount,
        }),
      );
      // playSound('pile_move');
      await delay(200);
    }
    const updateState = getState();
    const updatePlottedPieces = selectCurrentPositions(updateState);

    //check colliding

    const finalPlot = updatePlottedPieces?.filter(
      item => item.pos == finalPath,
    );
    const ids = finalPlot.map(item => item.id[0]);
    const uniqueIds = new Set(ids);
    const areDifferentIds = uniqueIds.size > 1;

    if (safeSpots.includes(finalPath) || safeSpots.includes(finalPath)) {
      // playSound('safe_spot')
    }
    if (
      areDifferentIds &&
      !safeSpots.includes(finalPlot[0].pos) &&
      !safeSpots.includes(finalPlot[0].pos)
    ) {
      const enemyPiece = finalPlot.find(Pieece => piece.id[0] !== id[0]);
      const enemyId = enemyPiece.id[0];
      let no = enemyId == 'A' ? 1 : enemyId == 'B' ? 2 : enemyId == 'C' ? 3 : 4;

      let backwardPath = startingPoints[no - 1];
      let i = enemyPiece.pos;
      // playSound('Collide';)

      while (i !== backwardPath) {
        dispatch(
          updatePlayerPieceValue({
            playerNo: `player${no}`,
            pieceId: enemyPiece.id,
            pos: i,
            travelCount: 0,
          }),
        );
        await delay(0.4);
        i--;
        if (i == 0) {
          i = 52;
        }
      }
      dispatch(
        updatePlayerPieceValue({
          playerNo: `player${no}`,
          pieceId: enemyPiece.id,
          pos: i,
          travelCount: 0,
        }),
      );

      dispatch(unfreezeDice());
      return;
    }

    if (diceNo == 6 || travelCount == 57) {
      dispatch(updatePlayerChance({chancePlayer: playerNo}));
      if (travelCount == 57) {
        //check winning criteria

        // playSound('home_win')
        const finalPlayerState = getState();
        const playerAllPieces = finalPlayerState.game[`player${playerNo}`];
        if (checkWinningCriteria(playerAllPieces)) {
          dispatch(announcewinner(playerNo));
          // playSound('cheer')
          return;
        }
        dispatch(updatefireworks(true));
        dispatch(unfreezeDice());
        return;
      }
    } else {
      let chancePlayer = playerNo + 1;
      if (chancePlayer > 4) {
        chancePlayer = 1;
      }
      dispatch(updatePlayerChance({chancePlayer}));
    }
  };

function checkWinningCriteria(piece) {
  for (let piece of piece) {
    if (piece.travelCount < 57) {
      return true;
    }
  }
}
