import './SplashScreen.css';

export default function SplashScreen() {
    return (
        <div className="splash-screen">
            <div className="splash-content">
                <img src="/src-tauri/icons/128x128@2x.png" alt="Vertebra Logo" className="splash-logo" />
                <div className="splash-spinner"></div>
            </div>
        </div>
    );
}
