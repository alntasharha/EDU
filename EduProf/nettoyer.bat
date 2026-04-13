@echo off
echo ===================================
echo  NETTOYAGE FICHIERS INUTILES
echo  EduProf - Preparation mise en ligne
echo ===================================
echo.

echo [1/4] Suppression fichiers e-commerce...
del /f /q cart.html cart-script.js cart-styles.css 2>nul
del /f /q checkout.html checkout-script.js checkout-styles.css 2>nul
del /f /q products.html products-script.js products-styles.css 2>nul
del /f /q fashion-script.js fashion-styles.css 2>nul
echo ✓ Fichiers e-commerce supprimes

echo.
echo [2/4] Suppression fichiers temporaires...
del /f /q deploy-commands.ps1 GITHUB_PAGES_SETUP.md DEPLOYMENT.md 2>nul
echo ✓ Fichiers temporaires supprimes

echo.
echo [3/4] Suppression dossiers inutiles...
if exist ".vscode" rmdir /s /q ".vscode" 2>nul
if exist "EduProf" rmdir /s /q "EduProf" 2>nul
echo ✓ Dossiers supprimes

echo.
echo [4/4] Nettoyage termine !
echo.
echo Fichiers restants :
dir /b

echo.
echo ===================================
echo  Appuyez sur une touche pour fermer
echo ===================================
pause >nul
