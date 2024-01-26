function navigateToPage(page, params) {
    console.log('Navigating to', page, 'with params', params);  // デバッグ用のコンソール出力
    const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
    const url = page + '?' + queryString;
    window.location.href = url;
}

