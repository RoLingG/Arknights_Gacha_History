document.addEventListener('DOMContentLoaded', function() {
    let data = null;

    // 如果是服务器部署，记得该这个接口的子域名
    fetch('http://localhost:8081/gacha-history')
        .then(response => response.json())
        .then(response => {
            data = response;
            totalPages = Object.keys(data).length;
            createCharts(data);
            displayRareChars(data);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });

    function createCharts(data) {
        const chartContainer = document.getElementById('chartContainer');
        Object.keys(data).forEach(poolName => {
            const items = data[poolName];
            const rarityCounts = {2: 0, 3: 0, 4: 0, 5: 0}; // 对应三星、四星、五星、六星
            const rareFiveChars = [];

            items.forEach(item => {
                rarityCounts[item.rarity] += 1;
                if (item.rarity === 5) {
                    rareFiveChars.push(item.charName);
                    if (rareFiveChars.length > 5) {
                        rareFiveChars.shift();
                    }
                }
            });

            const ctx = document.createElement('canvas');
            const canvasId = `chart_${poolName}`;
            ctx.id = canvasId;
            chartContainer.appendChild(ctx);

            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['3★', '4★', '5★', '6★'], // 对应三星、四星、五星、六星
                    datasets: [{
                        label: poolName,
                        data: Object.values(rarityCounts),
                        backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56'],
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: false, // 设置为false以保持固定大小
                    plugins: {
                        legend: {
                            position: 'top'
                        },
                        title: {
                            display: true,
                            text: `${poolName} 寻访记录`,
                            font: {
                                size: 20
                            }
                        },
                    }
                }
            });
        });
    }

    function displayRareChars(data) {
        const rareCharsContainer = document.getElementById('rareCharsContainer');
        Object.keys(data).forEach(poolName => {
            const items = data[poolName];
            const rareFiveChars = [];
            const count = items.length;

            items.forEach(item => {
                if (item.rarity === 5) {
                    rareFiveChars.push(item.charName);
                    if (rareFiveChars.length > 5) {
                        rareFiveChars.shift();
                    }
                }
            });

            const rareCharsDiv = document.createElement('div');
            rareCharsDiv.innerHTML = `<span>总寻访数: ${count}，《${poolName}》寻访最近出的六星为:</span><ul>${rareFiveChars.map(name => `<li>${name}</li>`).join('')}</ul>`;
            rareCharsContainer.appendChild(rareCharsDiv);
        });
    }
});