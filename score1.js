class CricketGame {
    constructor() {
        this.team1 = '';
        this.team2 = '';
        this.overs = 0;
        this.tossWon = '';
        this.batFirst = '';
        this.bowlFirst = '';
        this.innings = 1;
        this.score = 0;
        this.wickets = 0;
        this.balls = 0;
        this.target = 0;
        this.strike = 1;
        this.unstrike = 2;
        this.bowling = '';
        this.players = {
            team1: [],
            team2: []
        };
        this.stats = {
            batting: {},
            bowling: {}
        };
    }

    initializePlayerStats(team) {
        this.players[team].forEach(player => {
            this.stats.batting[player] = { runs: 0, balls: 0, srate: 0 };
            this.stats.bowling[player] = { runs: 0, balls: 0, wickets: 0, maiden: 0, economy: 0 };
        });
    }

    setupGame() {
        this.team1 = $('#team1').val();
        this.team2 = $('#team2').val();
        this.overs = parseInt($('#overs').val());

        for (let i = 1; i <= 11; i++) {
            this.players.team1.push($(`#player${i}team1`).val());
            this.players.team2.push($(`#player${i}team2`).val());
        }

        this.initializePlayerStats('team1');
        this.initializePlayerStats('team2');

        const toss1 = $('#toss1').val().toLowerCase();
        const tossResult = Math.random() < 0.5 ? 'heads' : 'tails';
        this.tossWon = toss1 === tossResult ? this.team1 : this.team2;

        const choice = $('#choice').val().toLowerCase();
        if (choice === 'bat') {
            this.batFirst = this.tossWon;
            this.bowlFirst = this.tossWon === this.team1 ? this.team2 : this.team1;
        } else {
            this.bowlFirst = this.tossWon;
            this.batFirst = this.tossWon === this.team1 ? this.team2 : this.team1;
        }

        this.bowling = $('#first-bowler').val();
    }

    swapStrike() {
        [this.strike, this.unstrike] = [this.unstrike, this.strike];
    }

    updateScore(runs, batsmanRuns = runs, isLegalDelivery = true) {
        this.score += runs;
        if (batsmanRuns > 0) {
            this.stats.batting[this.getCurrentBatsman()].runs += batsmanRuns;
        }
        this.stats.bowling[this.bowling].runs += runs;
        if (isLegalDelivery) {
            this.balls++;
            this.stats.batting[this.getCurrentBatsman()].balls++;
            this.stats.bowling[this.bowling].balls++;
        }
    }

    handleWicket(isRunout = false, runoutPlayer = null) {
        this.wickets++;
        this.balls++;
        this.stats.bowling[this.bowling].balls++;
        if (!isRunout) {
            this.stats.bowling[this.bowling].wickets++;
        }

        if (isRunout) {
            if (runoutPlayer === this.getCurrentBatsman()) {
                this.strike = Math.max(this.strike, this.unstrike) + 1;
            } else {
                this.unstrike = Math.max(this.strike, this.unstrike) + 1;
            }
        } else {
            this.strike = Math.max(this.strike, this.unstrike) + 1;
        }
    }

    playBall(ballscore) {
        const scoreHandlers = {
            '1': () => { this.updateScore(1); this.swapStrike(); },
            '2': () => this.updateScore(2),
            '3': () => { this.updateScore(3); this.swapStrike(); },
            '4': () => this.updateScore(4),
            '5': () => { this.updateScore(5); this.swapStrike(); },
            '6': () => this.updateScore(6),
            'wide': () => this.updateScore(1, 0, false),
            'wide4': () => this.updateScore(5, 0, false),
            'legby': () => this.updateScore(1, 0),
            'noball': () => this.updateScore(1, 1, false),
            'noball1': () => this.updateScore(2, 2, false),
            'noball2': () => this.updateScore(3, 3, false),
            'noball4': () => this.updateScore(5, 5, false),
            'noball6': () => this.updateScore(7, 7, false),
            'lbw': () => this.handleWicket(),
            'bowled': () => this.handleWicket(),
            'stump': () => this.handleWicket(),
            'runout': () => { $('#runout-modal').show(); return; }
        };

        if (scoreHandlers[ballscore]) {
            scoreHandlers[ballscore]();
        } else {
            this.balls++;
        }

        if (this.balls % 6 === 0 && this.balls > 0) {
            this.swapStrike();
            if (this.wickets < 10 && this.balls < this.overs * 6) {
                $('#over-modal').show();
            }
        }
        updateUI();
    }

    isGameOver() {
        return (this.wickets >= 10) || (this.balls >= this.overs * 6);
    }

    startSecondInnings() {
        this.target = this.score + 1;
        this.innings = 2;
        this.score = 0;
        this.wickets = 0;
        this.balls = 0;
        [this.batFirst, this.bowlFirst] = [this.bowlFirst, this.batFirst];
        this.strike = 1;
        this.unstrike = 2;
        $('#innings-modal').hide();
        $('#over-modal').show();
    }

    getCurrentBatsman() {
        const team = this.batFirst === this.team1 ? 'team1' : 'team2';
        return this.players[team][this.strike - 1];
    }

    getUnstrikeBatsman() {
        const team = this.batFirst === this.team1 ? 'team1' : 'team2';
        return this.players[team][this.unstrike - 1];
    }
}

let game;

function startGame() {
    game = new CricketGame();
    game.setupGame();
    $('.setup-section').hide();
    $('.game-section').show();
    updateUI();
}

function play() {
    const ballscore = $('#input1').val();
    game.playBall(ballscore);
    if (game.isGameOver()) {
        if (game.innings === 1) {
            $('#innings-modal').show();
        } else {
            alert('Game Over');
        }
    }
}

function updateUI() {
    $('#main').text(`${game.batFirst} - ${game.score}/${game.wickets}`);
    $('#overs1').text(`Overs: ${Math.floor(game.balls / 6)}.${game.balls % 6}`);
    const strikeBatsman = game.getCurrentBatsman();
    const unstrikeBatsman = game.getUnstrikeBatsman();
    if (strikeBatsman) {
        const { runs, balls } = game.stats.batting[strikeBatsman];
        const srate = balls > 0 ? ((runs / balls) * 100).toFixed(2) : 0;
        $('#bat1').text(`${strikeBatsman} - ${runs} (${balls}) SR: ${srate}`);
    }
    if (unstrikeBatsman) {
        const { runs, balls } = game.stats.batting[unstrikeBatsman];
        const srate = balls > 0 ? ((runs / balls) * 100).toFixed(2) : 0;
        $('#bat2').text(`${unstrikeBatsman} - ${runs} (${balls}) SR: ${srate}`);
    }
    if (game.bowling) {
        $('#bowler').text(`${game.bowling} - ${game.stats.bowling[game.bowling].runs}/${game.stats.bowling[game.bowling].wickets}`);
    }
}

function openTab(evt, tabName) {
    $('.tab-content').hide();
    $('.tab-link').removeClass('active');
    $(`#${tabName}`).show();
    $(evt.currentTarget).addClass('active');
}

function overUp() {
    game.bowling = $('#bowlername').val();
    $('#over-modal').hide();
    updateUI();
}

function resetValues() {
    game.startSecondInnings();
}

function runOut() {
    const outPlayer = $('#runout').val();
    game.handleWicket(true, outPlayer);
    $('#runout-modal').hide();
    updateUI();
}


$(document).ready(function() {
    // Generate player input fields
    for (let i = 1; i <= 11; i++) {
        $('#team1-players').append(`<input type="text" id="player${i}team1" placeholder="Player-${i}">`);
        $('#team2-players').append(`<input type="text" id="player${i}team2" placeholder="Player-${i}">`);
    }
});
