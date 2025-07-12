$imageUrls = @{
    "hero-bg.jpg" = "https://www.daikin.co.kr/upload/editor/2023/06/20230619153347_1.jpg"
    "residential.jpg" = "https://www.daikin.co.kr/upload/editor/2023/06/20230619153347_2.jpg"
    "commercial.jpg" = "https://www.daikin.co.kr/upload/editor/2023/06/20230619153347_3.jpg"
    "ceiling.jpg" = "https://www.daikin.co.kr/upload/editor/2023/06/20230619153347_4.jpg"
    "stand.jpg" = "https://www.daikin.co.kr/upload/editor/2023/06/20230619153347_5.jpg"
    "gallery1.jpg" = "https://www.daikin.co.kr/upload/editor/2023/06/20230619153347_6.jpg"
    "gallery2.jpg" = "https://www.daikin.co.kr/upload/editor/2023/06/20230619153347_7.jpg"
    "gallery3.jpg" = "https://www.daikin.co.kr/upload/editor/2023/06/20230619153347_8.jpg"
    "gallery4.jpg" = "https://www.daikin.co.kr/upload/editor/2023/06/20230619153347_9.jpg"
    "gallery5.jpg" = "https://www.daikin.co.kr/upload/editor/2023/06/20230619153347_10.jpg"
    "gallery6.jpg" = "https://www.daikin.co.kr/upload/editor/2023/06/20230619153347_11.jpg"
}

foreach ($image in $imageUrls.GetEnumerator()) {
    $outputPath = Join-Path "images" $image.Key
    Invoke-WebRequest -Uri $image.Value -OutFile $outputPath
    Write-Host "Downloaded $($image.Key)"
} 