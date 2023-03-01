/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */


/**
 * In this class we're extending doughnut controller from chartjs to make our own
 * customized chart.
 *
 * @class DoughnutChart
 * @namespace Vendor
 * @extends Chart.DoughnutController
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
class DoughnutChart extends Chart.DoughnutController {

    /**
     * This function is used by chartjs to create a chart. We're overriding this
     * function in order to make our own customized shape of doughnut chart.
     *
     * @method draw
     * @public
     */
    draw() {
        super.draw(arguments);
        this._draw();
    }

    /**
     * This function is used inside draw function. This is responsible for adding new shapes
     * to the existing doughnut chart.
     *
     * @method draw
     * @private
     */
    _draw() {
        let arcSections = this.getMeta().data;
        let ctx = this.chart.ctx;
        let _self = this;

        arcSections.forEach((arcSection, i) => {
            if (_self.chart.getDataVisibility(arcSection.$context.dataIndex)) {
                let centerAngle = (arcSection.startAngle + arcSection.endAngle) / 2;
                let x = arcSection.getCenterPoint().x;
                let y = arcSection.getCenterPoint().y;
                let diagonalLineX = x + arcSection.innerRadius * Math.cos(centerAngle);
                let diagonalLineY = y + arcSection.innerRadius * Math.sin(centerAngle);
                let legend = _self.chart.legend.legendItems[i];
                let text = `${legend.text} - ${arcSection.$context.parsed}`;
                //creating new shapes
                ctx.strokeStyle = arcSection.options.backgroundColor;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(diagonalLineX, diagonalLineY);

                let newLineY = _self._recalculateYPosition(_self, i, diagonalLineY);
                ctx.font = "italic 12px Source Sans Pro";
                if (arcSection.startAngle >= 1.57 || (arcSection.startAngle >= -0.5 && arcSection.endAngle >= 1.57)) {
                    ctx.lineTo(diagonalLineX - 10, newLineY);
                    ctx.fillText(text, diagonalLineX - ctx.measureText(text).width - 12, newLineY + 4);

                } else {
                    ctx.lineTo(diagonalLineX + 10, newLineY);
                    ctx.fillText(text, diagonalLineX + 12, newLineY + 4);
                }
                ctx.stroke();
            }
        });
    }

    /**
     * This function is used to recalculate the y-axis position of the current arc. The way
     * it works is that, it get y-axis position of next arc and check that if current and next arc
     * y-axis position difference is less then 5 then add some value to current arc y position, to
     * maintain a distance between both arcs.
     *
     * @method _recalculateYPosition
     * @private
     */
    _recalculateYPosition(ctx, i, currentArcLineY) {
        let j = (ctx.getMeta().data.length !== i + 1) ? i + 1 : i - 1;
        let arcSection = ctx.getMeta().data[j];
        let y = arcSection.getCenterPoint().y;
        let centerAngle = (arcSection.startAngle + arcSection.endAngle) / 2;
        let nextArcLineY = y + arcSection.innerRadius * Math.sin(centerAngle);
        let diff = currentArcLineY - nextArcLineY;
        if (Math.abs(diff) <= 5) {
            currentArcLineY += Math.abs(diff) + 7;
        }
        return currentArcLineY;
    }
}
DoughnutChart.id = 'customizedDoughnut';
DoughnutChart.defaults = Chart.DoughnutController.defaults;

// Stores the controller so that the chart initialization routine can look it up
Chart.register(DoughnutChart);