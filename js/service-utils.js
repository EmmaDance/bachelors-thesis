async function getScore() {
    const url = 'http://localhost:3000/score/sample';

    return await $.ajax({
        url: url,
        type: 'GET',
        success: function (res) {
            return res;
        },
        error: function (xhr, status, error) {
            console.log(error);
        }

    });
}

export const Ajax = {
    getScore: getScore
}
