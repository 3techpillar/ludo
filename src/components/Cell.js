import {View, StyleSheet} from 'react-native';
import React, {useCallback, useMemo} from 'react';
import {Colors} from '../constants/Colors';
import Pile from './Pile';
import {ArrowSpot, safeSpots, starSpots} from '../helpers/PlotData';
import {ArrowRightIcon, StarIcon} from 'react-native-heroicons/outline';
import {RFValue} from 'react-native-responsive-fontsize';
import {useDispatch, useSelector} from 'react-redux';
import {selectCurrentPositions} from '../redux/reducers/gameSelectors';
import {handleForwardThunk} from '../redux/reducers/gameAction';

const Cell = ({color, id}) => {
  const dispatch = useDispatch();

  // Ensure plottedPieces has a default empty array to prevent undefined errors
  const plottedPieces = useSelector(selectCurrentPositions);

  const isSafeSpot = useMemo(() => safeSpots.includes(id), [id]);
  const isStarSpot = useMemo(() => starSpots.includes(id), [id]);
  const isArrowSpot = useMemo(() => ArrowSpot.includes(id), [id]);

  // Only filter if plottedPieces is an array

  const pieceAtPosition = useMemo(
    () =>
      Array.isArray(plottedPieces)
        ? plottedPieces.filter(item => item.pos === id)
        : [],
    [plottedPieces, id],
  );

  console.log(plottedPieces, id);

  const handlePress = useCallback(
    (playerNo, pieceId) => {
      dispatch(handleForwardThunk(playerNo, pieceId, id));
    },
    [dispatch, id],
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isSafeSpot ? color : 'white',
        },
      ]}>
      {isStarSpot && <StarIcon size={20} color="grey" />}
      {isArrowSpot && (
        <ArrowRightIcon
          style={{
            transform: [
              {
                rotate:
                  id === 38
                    ? '180deg'
                    : id === 25
                    ? '90deg'
                    : id === 51
                    ? '-90deg'
                    : '0deg',
              },
            ],
          }}
          size={RFValue(12)}
          color={'gray'}
        />
      )}
      {pieceAtPosition.length > 0 &&
        pieceAtPosition?.map((piece, index) => {
          const playerNo =
            piece.id[0] === 'A'
              ? 1
              : piece.id[0] === 'B'
              ? 2
              : piece.id[0] === 'C'
              ? 3
              : 4;
          const pieceColor =
            playerNo === 1
              ? Colors.red
              : playerNo === 2
              ? Colors.green
              : playerNo === 3
              ? Colors.yellow
              : Colors.blue;

          return (
            <View
              key={piece.id}
              style={[
                styles.pieceContainer,
                {
                  transform: [
                    {
                      scale: pieceAtPosition.length === 1 ? 1 : 0.7,
                    },
                    {
                      translateX:
                        pieceAtPosition.length === 1
                          ? 0
                          : index % 2 === 0
                          ? -6
                          : 6,
                    },
                    {
                      translateY:
                        pieceAtPosition.length === 1 ? 0 : index < 2 ? -6 : 6,
                    },
                  ],
                },
              ]}>
              <Pile
                cell={true}
                player={playerNo}
                onPress={() => handlePress(playerNo, piece.id)}
                pieceId={piece.id}
                color={pieceColor}
              />
            </View>
          );
        })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 0.4,
    borderColor: Colors.borderColor,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieceContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    zIndex: 99,
  },
});

export default React.memo(Cell);
