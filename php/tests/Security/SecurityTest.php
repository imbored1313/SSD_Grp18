<?php

namespace Tests\Security;

use PHPUnit\Framework\TestCase;

class SecurityTest extends TestCase
{
    public function testNoHardcodedPasswords()
    {
        $phpFiles = $this->getPhpFiles(__DIR__ . '/../../');

        foreach ($phpFiles as $file) {
            $content = file_get_contents($file);

            // Check for hardcoded passwords
            $this->assertNotRegExp(
                '/password\s*=\s*[\'"][^\'"]{6,}[\'"]/',
                $content,
                "Hardcoded password found in $file"
            );

            // Check for hardcoded database credentials
            $this->assertNotRegExp(
                '/MYSQL_PASSWORD\s*=\s*[\'"][^\'"]+[\'"]/',
                $content,
                "Hardcoded database password found in $file"
            );
        }
    }

    public function testNoSQLInjectionVulnerabilities()
    {
        $phpFiles = $this->getPhpFiles(__DIR__ . '/../../');

        foreach ($phpFiles as $file) {
            $content = file_get_contents($file);

            // Check for direct variable usage in SQL queries
            $this->assertNotRegExp(
                '/SELECT.*\$_[GET|POST|REQUEST]/',
                $content,
                "Potential SQL injection vulnerability found in $file"
            );
        }
    }

    public function testNoXSSVulnerabilities()
    {
        $phpFiles = $this->getPhpFiles(__DIR__ . '/../../');

        foreach ($phpFiles as $file) {
            $content = file_get_contents($file);

            // Check for direct output of user input
            $this->assertNotRegExp(
                '/echo\s+\$_[GET|POST|REQUEST]/',
                $content,
                "Potential XSS vulnerability found in $file"
            );
        }
    }

    public function testSecureFilePermissions()
    {
        $configFile = __DIR__ . '/../../config.php';
        $permissions = fileperms($configFile) & 0777;

        // Config file should not be world-readable
        $this->assertNotEquals(0644, $permissions, "Config file has insecure permissions");
    }

    private function getPhpFiles($directory)
    {
        $files = [];
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($directory)
        );

        foreach ($iterator as $file) {
            if ($file->isFile() && $file->getExtension() === 'php') {
                $files[] = $file->getPathname();
            }
        }

        return $files;
    }
}
