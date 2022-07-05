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
 * @author Rana Nouman <ranamnouman@yahoo.com>
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
                let lineX = x + arcSection.innerRadius * Math.cos(centerAngle);
                let lineY = y + arcSection.innerRadius * Math.sin(centerAngle);
                let legend = _self.chart.legend.legendItems[i];
                let text = `${legend.text} - ${arcSection.$context.parsed}`;

                //creating new shapes
                ctx.strokeStyle = arcSection.options.backgroundColor;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(lineX, lineY);
                ctx.font = "12px Source Sans Pro";
                if (arcSection.startAngle >= 1.57 || (arcSection.startAngle >= -0.5 && arcSection.endAngle >= 1.57)) {
                    ctx.lineTo(lineX - 10, lineY);
                    ctx.fillText(text, lineX - ctx.measureText(text).width - 12, lineY + 4);

                } else {
                    ctx.lineTo(lineX + 10, lineY);
                    ctx.fillText(text, lineX + 12, lineY + 4);
                }
                ctx.stroke();
            }
        });
    }
}

DoughnutChart.id = 'customizedDoughnut';
DoughnutChart.defaults = Chart.DoughnutController.defaults;

// Stores the controller so that the chart initialization routine can look it up
Chart.register(DoughnutChart);