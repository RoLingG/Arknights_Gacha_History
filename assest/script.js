document.addEventListener('DOMContentLoaded', function() {
    let currentPage = 1;
    let itemsPerPage = 10;
    let totalPages = 0;
    let data = null;

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
                            text: `${poolName} Rarity Distribution`
                        }
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
            rareCharsDiv.innerHTML = `<h3>Total Count: ${count}, Top 5 Rare Five Stars Characters in ${poolName}:</h3><ul>${rareFiveChars.map(name => `<li>${name}</li>`).join('')}</ul>`;
            rareCharsContainer.appendChild(rareCharsDiv);
        });
    }
});