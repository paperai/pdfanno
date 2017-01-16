/**
 *   The list of functionalities for a relationship between annotations.
 */

/**
 * Get bezier control point.
 *
 * @params x1 : the x of a start position.
 * @params y1 : the y of a start position.
 * @params x2 : the x of an end position.
 * @params y2 : the y of an end position.
 * @return { x, y } the position of bezier control.
 */
export function findBezierControlPoint(x1, y1, x2, y2) {

    const DISTANCE = 30;

    // vertical line.
    if (x1 === x2) {
      return {
        x: x1,
        y: (y1 + y2) / 2
      };
    }

    // horizontal line.
    if (y1 === y2) {
      return {
        x: (x1 + x2) / 2,
        y: y1 - DISTANCE
      };
    }

    let center = {
      x: (x1 + x2) / 2,
      y: (y1 + y2) / 2
    };

    let gradient = (y1 - y2) / (x1 - x2);
    gradient = -1 / gradient;

    let theta = Math.atan(gradient);
    let deltaX = Math.cos(theta) * DISTANCE;
    let deltaY = Math.sin(theta) * DISTANCE;

    if (x1 < x2) {
      // right top quadrant.
      if (y1 > y2) {
        return {
          x: center.x - Math.abs(deltaX),
          y: center.y - Math.abs(deltaY)
        };
      // right bottom quadrant.
      } else {
        return {
          x: center.x + Math.abs(deltaX),
          y: center.y - Math.abs(deltaY)
        };
      }
    } else {
      // left top quadrant.
      if (y1 > y2) {
        return {
          x: center.x + Math.abs(deltaX),
          y: center.y - Math.abs(deltaY)
        };
      // left bottom quadrant.
      } else {
        return {
          x: center.x - Math.abs(deltaX),
          y: center.y - Math.abs(deltaY)
        };
      }
    }
}


export function getRelationTextPosition(svgOrNull, x1, y1, x2, y2) {

    let textPosition = findBezierControlPoint(x1, y1, x2, y2);

    if (svgOrNull) {
      // Coordinate for DOM.
      let rect = svgOrNull.getBoundingClientRect();
      textPosition.x += rect.left;
      textPosition.y += rect.top;      
    }

    if (x1 < x2) {
      // right top quadrant.
      if (y1 > y2) {
        textPosition.x += 10;
        textPosition.y -= 20;
      // right bottom quadrant.
      } else {
        textPosition.x += 10;
        textPosition.y -= 10;
      }
    } else {
      // left top quadrant.
      if (y1 > y2) {
        textPosition.x += 10;
        textPosition.y -= 20;
      // left bottom quadrant.
      } else {
        textPosition.x += 10;
        textPosition.y += 10;
      }
    }

    return textPosition;
}